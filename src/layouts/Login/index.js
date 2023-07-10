import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import MetamaskContext from "../../context/Metamask";
import { prefNetwork } from "../../constants";

function Login() {
  const { connect, disconnect, isMetamaskConnected, account } =
    useContext(MetamaskContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async () => {
    setLoading(true);
    const success = await connect();
    setLoading(false);
    if (success) navigate("/mint");
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await disconnect();
    setLoading(false);
  };

  return (
    <div className="login-container">
      {/* Connect */}
      {!isMetamaskConnected && (
        <div className="login-content">
          <button
            className="action-button connect"
            disabled={loading}
            onClick={handleConnect}
            style={{ cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading
              ? "Connecting to your Wallet ..."
              : "Connect to your Wallet"}
          </button>
        </div>
      )}

      {/* Account Info & Disconnect */}
      {isMetamaskConnected && (
        <div className="login-box">
          <div className="account-info">
            <div className="account-button">
              {isMetamaskConnected && (
                <div className="account-info">
                  <div>
                    <Link to="/mint" style={{ textDecoration: "none" }}>
                      <div className="row-end">
                        <h5 className="link-text">Go to NFT Minter</h5>
                        <div className="right-arrow"></div>
                      </div>
                    </Link>
                  </div>

                  <p className="subtitles">{account}</p>
                  <p className="subtitles">{prefNetwork.name}</p>
                  <button
                    className="action-button"
                    onClick={handleDisconnect}
                    disabled={loading}
                    style={{ cursor: loading ? "not-allowed" : "pointer" }}
                  >
                    {loading
                      ? "Disconnecting your Wallet ..."
                      : "Disconnect your Wallet"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
