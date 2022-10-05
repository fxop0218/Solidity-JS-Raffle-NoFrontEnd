const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccoutns, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccoutns()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    } else {
        // TODO create a subscription id in chainLink automatically from the backend
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
    }

    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const raffle = await ("Raffle",
    {
        from: deployer,
        args: [vrfCoordinatorV2Address, entranceFee, gasLane], // Constructors values
        logs: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
}
