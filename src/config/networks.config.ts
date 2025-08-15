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
  "xdc": {
    chainId: 50,
    rpcUrl: "https://erpc.xinfin.network",
    blockExplorerUrl: "https://xdcscan.io",
    nativeCurrency: {
      name: "XDC",
      symbol: "XDC",
      decimals: 18,
    },
    // tribeControllerAddress: "0xC3e041F72365c7FEA790D03ae299c377A8022B89",
    // profileNFTMinterAddress: "0x7A49206f74A3c7f6427AB24ABe612E0C81709107",
    // eventTicketsAddress: "0x5AE8ac02613EBA7f7896bD554d74F1fDF7Baa3f0",
    // postMinterAddress: "0xcb168B5AAAdA11135E03BfD3FD535573A8CCC20d",
    // roleManagerAddress: "0xDaA67f784d9CE364EC4A251C6f8160231Fda4042",
    tribeControllerAddress: "0x7930B9CD5216cABa295753C8542b250BC77A4DAb",
    profileNFTMinterAddress: "0x3054D725BABE2FACa9b0cE26480E463511B3F24F",
    eventTicketsAddress: "0x77c9fF5b465b96f22534e11F2B672d6c5c8387Bf",
    postMinterAddress: "0xa3Af1b4a7676360e155D4a7603E7c5BAb7Cc867D",
    roleManagerAddress: "0x5e7c0b7DaEeDe99e0A342Ac416C32d21910d3d96",
  }
}