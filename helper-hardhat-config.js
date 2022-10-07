const { ethers } = require("hardhat")

const networkConfig = {
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e", //https://docs.chain.link/docs/data-feeds/price-feeds/addresses/#Goerli%20Testnet
        vrfCoordinatorV2: "0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d",
        entranceFee: ethers.utils.parseEther("0.1"),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // https://docs.chain.link/docs/vrf/v2/subscription/supported-networks/#goerli-testnet
        subscriptionId: "3668", // Chainlink subcription
        callbackGasLimit: "500000",
        keepersUpdateInterval: "30",
    },
    31337: {
        name: "localhost",
        subscriptionId: "588",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
        keepersUpdateInterval: "30",
        entranceFee: ethers.utils.parseEther("0.01"), // 0.1 ETH
        callbackGasLimit: "500000", // 500,000 gas
    },
}

const developmentChains = ["hardhat", "localhost", "ganache"]
const BASE_FEE = ethers.utils.parseEther("0.1") // 0.25 is the premium
const GAS_PRICE_LINK = 1e9

module.exports = {
    networkConfig,
    developmentChains,
    BASE_FEE,
    GAS_PRICE_LINK,
}
