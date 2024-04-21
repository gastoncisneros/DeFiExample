const networkConfig: any = {
    31337: {
        name: "WETH",
        wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        daiToken: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
};

const developmentChains = ["hardhat", "localhost"];

export { networkConfig, developmentChains };
