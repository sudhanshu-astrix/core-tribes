interface NetworksConfig {
  [key: string]: {
    chainId: number;
    rpcUrl: string;
    blockExplorerUrl: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    tribeControllerAddress: string;
    profileNFTMinterAddress: string;
    eventTicketsAddress: string;
    postMinterAddress: string;
    roleManagerAddress: string;
  }
}

export const networksConfig: NetworksConfig = {
  core_testnet: {
    chainId: 1114,
    rpcUrl: "https://rpc.test2.btcs.network",
    blockExplorerUrl: "https://scan.test2.btcs.network",
    nativeCurrency: {
      name: "tCore2",
      symbol: "tCore2",
      decimals: 18
    },
    tribeControllerAddress: "0x1237266D5a787DFDd5DdB7BAEaF260A474CCE66C",
    profileNFTMinterAddress: "0xAC0761E1E6324b4b7587287275F3e2D4467c2068",
    eventTicketsAddress: "0xf7bf8FAADc25047060Bcfa3Bf208268038964F3C",
    postMinterAddress: "0xf2DE8ceB8867D5bA47f2767Cd726C318D4267375",
    roleManagerAddress: "0x44174ec378E9119495Cf6CE503A28666a4605A4d",
  }
}
