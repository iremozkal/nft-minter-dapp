import React from "react";
import {
  useEffect,
  useState,
  useMemo,
  createContext,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { prefNetwork } from "../../constants";
import AuthService from "../../services/Auth";

const ethers = require("ethers");

const MetamaskContext = createContext();

function MetamaskProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);

  /**
   * This method checks whether we are connected on metamask.
   * @returns { isMetamaskConnected: bool, account: string };
   */
  const checkIfConnected = useCallback(async () => {
    try {
      /**
       * window.ethereum:
       * MetaMask injects a global API into websites visited by its users at window.ethereum
       * (Also available at window.web3.currentProvider for legacy reasons).
       * This API allows websites to request user login, load data from blockchains the user has a connection.
       * You can use this API to detect the user of a web3 browser.
       * */
      if (typeof window.ethereum !== "undefined") {
        // provider: an abstraction of a connection to the chain network
        const provider = new ethers.providers.Web3Provider(
          window.ethereum,
          parseInt(prefNetwork.chainId)
        );

        // getting the account
        const signer = provider.getSigner();
        if (signer) {
          return {
            isMetamaskConnected: true,
            account: await signer.getAddress(),
          };
        }
        return { isMetamaskConnected: false, account: null };
      }

      console.log("[ERROR] Please install Metamask!");
      return { isMetamaskConnected: false, account: null };
    } catch (error) {
      console.log("[ERROR] checkIfConnected provider error: ", error);
      return { isMetamaskConnected: false, account: null };
    }
  }, []);

  /**
   * This method checks whether we are on the right network which is set on prefNetwork.
   * @returns isRightNetwork: bool
   */
  const checkIfRightNetwork = useCallback(async () => {
    if (!window.ethereum) return false;

    // getting the chainId we are connected with metamask.
    const networkId = await window.ethereum.request({ method: "eth_chainId" });

    // if our prefNetwork is not same with the connected network,
    // first we assume metamask includes our prefNetwork info so we'll try to switch to it.
    // if its not included in metamask, then we'll try to add the prefNetwork to metamask and chose it.
    if (
      networkId !== prefNetwork.chainId &&
      networkId !== prefNetwork.chainHex
    ) {
      alert(`Only available on ${prefNetwork.name} switching...`);

      // switch
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: prefNetwork.chainHex }],
        });

        return true;
      } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask.
        const WALLET_ERROR_CODE = 4902;

        if (error.code === WALLET_ERROR_CODE) {
          try {
            // add
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: prefNetwork.chainHex,
                  rpcUrls: prefNetwork.rpcUrls,
                  nativeCurrency: prefNetwork.nativeCurrency,
                  chainName: prefNetwork.name,
                },
              ],
            });
            return true;
          } catch (addError) {
            console.log("[ERROR] Network Add error", addError);
            return false;
          }
        }
        // handle other "switch" errors
        console.log("[ERROR] Switch Network Error");
        return false;
      }
    }
    return true;
  }, []);

  /**
   * This method works on accountsChanged events inside eventListeners method.
   * If there is no account connected on metamask, we'll disconnect.
   * @param accounts: any
   * accounts will always be an array, but it can be empty.
   */
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length < 1) disconnect();
    else setAccount(ethers.utils.getAddress(accounts[0]));
  }, []);

  /**
   * This method works on chainChanged events inside eventListeners method.
   * If the network is not our prefNetwork, then we'll disconnect.
   */
  const handleNetworkChange = useCallback(async () => {
    if (!window.ethereum) return;
    const networkId = await window.ethereum.request({ method: "eth_chainId" });
    if (
      networkId !== prefNetwork.chainId &&
      networkId !== prefNetwork.chainHex
    ) {
      disconnect();
    }
  }, []);

  /**
   * Listen some of the events metamask provides.
   * https://docs.metamask.io/guide/ethereum-provider.html#events
   */
  const eventListeners = useCallback(() => {
    window.ethereum.on("chainChanged", handleNetworkChange);
    window.ethereum.on("accountsChanged", handleAccountsChanged);
  }, [handleAccountsChanged, handleNetworkChange]);

  /**
   * This method works on click to connect button.
   * If we are on the right network, it pulls the connected account from metamask,
   * and set it on your local storage.
   * @returns success: bool
   */
  const connect = useCallback(async () => {
    if (window.ethereum) {
      const isRightNetwork = await checkIfRightNetwork();
      if (!isRightNetwork) return false;

      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(
          window.ethereum,
          parseInt(prefNetwork.chainId)
        );

        const signer = provider.getSigner();
        const wallet = await signer.getAddress();
        const walletAddress = ethers.utils.getAddress(wallet);

        AuthService.setAuthPayload({
          account: walletAddress,
          isMetamaskConnected: true,
        });

        setAccount(walletAddress);
        setIsMetamaskConnected(true);

        return true;
      } catch (e) {
        console.log("[ERROR] Metamask connect: ", e);
        if (e.code === -32002) {
          alert(
            "A request has already been processed to get accounts in the background of your Metamask. Please check your Metamask."
          );
          return false;
        }
        alert("Please confirm your wallet from MetaMask");
        disconnect();
        return false;
      }
    } else {
      alert("Please install MetaMask to connect!");
      disconnect();
      return false;
    }
  }, [checkIfRightNetwork]);

  /**
   * This method resets the state of the connection and auth payload.
   */
  const disconnect = () => {
    setIsMetamaskConnected(false);
    setAccount(null);
    AuthService.removeAuthPayload();
  };

  /**
   * This method checks if we have auth payload set on our local storage
   * to keep the session alive on refresh page.
   */
  const localAuthCheck = useCallback(async () => {
    if (window.ethereum) {
      // check if metamask connected to our page
      const connection = await checkIfConnected();
      // check if we are on the right network
      const isRightNetwork = await checkIfRightNetwork();

      const auth = AuthService.getAuthPayload();

      // if everything is set, continue with the saved information.
      if (connection.isMetamaskConnected && isRightNetwork && auth) {
        setIsMetamaskConnected(connection.isMetamaskConnected);
        setAccount(connection.account);
        eventListeners();
      }
      // if our metamask is not connected to our page,
      // make sure we do not have any auth history on our local storage since we are not connected.
      else if (auth && auth.account && auth.isMetamaskConnected) {
        AuthService.removeAuthPayload();
        setIsMetamaskConnected(false);
        setAccount(null);
        return;
      }
    } else {
      alert("Please install Metamask!");
      setIsMetamaskConnected(false);
      setAccount(null);
    }
  }, [checkIfConnected, checkIfRightNetwork, eventListeners]);

  useEffect(() => {
    // on first load, check local storage and the metamask connection.
    if (window.ethereum) localAuthCheck();
  }, [localAuthCheck]);

  useEffect(() => {
    // Whenever the state of connection or account is changed, listen the event for proper actions.
    if (window.ethereum) eventListeners();
  }, [isMetamaskConnected, account, eventListeners]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const values = useMemo(
    () => ({
      isMetamaskConnected,
      connect,
      disconnect,
      account,
    }),
    [isMetamaskConnected, account, connect]
  );

  return (
    <MetamaskContext.Provider value={values}>
      {children}
    </MetamaskContext.Provider>
  );
}

MetamaskProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MetamaskContext;
export { MetamaskProvider };
