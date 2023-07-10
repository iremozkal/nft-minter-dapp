export const prefNetwork = {
  chainId: process.env.REACT_APP_PREF_NETWORK_CHAIN_ID,
  chainHex: process.env.REACT_APP_PREF_NETWORK_CHAIN_HEX,
  name: process.env.REACT_APP_PREF_NETWORK_NAME,
  rpcUrls: [process.env.REACT_APP_PREF_NETWORK_RPC_URLS],
  nativeCurrency: {
    name: process.env.REACT_APP_PREF_NETWORK_NATIVE_CURRENCY_NAME,
    decimals: parseInt(
      process.env.REACT_APP_PREF_NETWORK_NATIVE_CURRENCY_DECIMALS,
      10
    ),
    symbol: process.env.REACT_APP_PREF_NETWORK_NATIVE_CURRENCY_SYMBOL,
  },
};

export const PINATA_API = {
  BASE_URL: process.env.REACT_APP_PINATA_API_BASE_URL,
  URL: process.env.REACT_APP_PINATA_API_URL,
  KEY: process.env.REACT_APP_PINATA_API_KEY,
  SECRET: process.env.REACT_APP_PINATA_API_SECRET,
};
