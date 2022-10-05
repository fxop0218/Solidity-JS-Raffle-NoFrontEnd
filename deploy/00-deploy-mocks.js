const { developmentChains, BASE_FEE, GAS_PRICE_LINK } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = getNamedAccount()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        console.log("Local network detected")
        console.log(`Deoloying mocks in ${chainId} localnet`)
        await deploy("VRFCoordinatorV2Mock", {
            contract: "VRFCoordinatorV2Mock",
            from: deployer,
            args: [BASE_FEE, GAS_PRICE_LINK], // Values in MockV3Aggregator constructors
            log: true,
        })
        console.log("Mocks deployed successfully")
        console.log("************************************************")
    }
}
