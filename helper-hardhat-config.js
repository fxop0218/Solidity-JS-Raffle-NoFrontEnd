const networkConfig = {
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e", //https://docs.chain.link/docs/data-feeds/price-feeds/addresses/#Goerli%20Testnet
        vrfCoordinatorV2: "0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d",
        entranceFee: ethers.utils.parseEthes("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // https://docs.chain.link/docs/vrf/v2/subscription/supported-networks/#goerli-testnet
    },
    31337: {
        name: "hardhat",
        entranceFee: ethers.utils.parseEthes("0.01"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    },
}

const developmentChains = ["hardhat", "localhost", "ganache"]
const BASE_FEE = ethers.utils.parseEthers("0.25") // 0.25 is the premium
const GAS_PRICE_LINK = 1e9

module.exports = {
    networkConfig,
    developmentChains,
    BASE_FEE,
    GAS_PRICE_LINK,
}
