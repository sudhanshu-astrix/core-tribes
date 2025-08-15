export interface Network {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

export interface WalletActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  addNetwork: (network: Network) => Promise<void>;
  getBalance: () => Promise<void>;
}

export type WalletStore = WalletState & WalletActions;

export const SUPPORTED_NETWORKS: Record<string, Network> = {
  ethereum: {
    chainId: 1,
    name: "Ethereum",
    rpcUrl: "https://mainnet.infura.io/v3/your-project-id",
    blockExplorerUrl: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  xdc: {
    chainId: 50,
    name: "XDC Network",
    rpcUrl: "https://rpc.xdcrpc.com",
    blockExplorerUrl: "https://xdcscan.io",
    nativeCurrency: {
      name: "XDC",
      symbol: "XDC",
      decimals: 18,
    },
  },
  polygon: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorerUrl: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  bsc: {
    chainId: 56,
    name: "BNB Smart Chain",
    rpcUrl: "https://bsc-dataseed.binance.org",
    blockExplorerUrl: "https://bscscan.com",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
  },
}; 