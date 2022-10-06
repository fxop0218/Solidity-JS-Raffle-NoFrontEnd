const { developmentChains, BASE_FEE, GAS_PRICE_LINK } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (chainId == 31337) {
        console.log("Local network detected")
        console.log(`Deoloying mocks in ${chainId} localnet`)
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        console.log("Mocks deployed successfully")
        console.log("************************************************")
    }
}

module.exports.tags = ["all", "mocks"]
