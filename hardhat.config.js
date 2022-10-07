require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("dotenv").config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const mainnetRpcURL =
    process.env.MAINNET_RPC_URL ||
    process.env.ALCHEMY_MAINNET_RPC_URL ||
    "https://eth-mainnet.alchemyapi.io/v2/apikey"
const goerliRpcURL = process.env.GOERLI_RPC_URL || "https://eth-goerli.alchemyapi.io/v2/apikey"
const privateKey = process.env.PRIVATE_KEY || "0x"

// Your API key for Etherscan, obtain one at https://etherscan.io/
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "0x"

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        goerli: {
            url: goerliRpcURL,
            accounts: privateKey !== undefined ? [privateKey] : [],
            saveDeployments: true,
            chainId: 5,
        },
        mainnet: {
            url: mainnetRpcURL,
            accounts: privateKey !== undefined ? [privateKey] : [],
            saveDeployments: true,
            chainId: 1,
        },
    },
    etherscan: {
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gas_report.txt",
        noColors: true,
    },
    contractSizer: {
        runOnCompile: false,
        only: ["Raffle"],
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
        player: {
            default: 1,
        },
    },
    mocha: {
        timeout: 500000,
    },
    solidity: {
        compilers: [
            {
                version: "0.8.17",
            },
            {
                version: "0.4.24",
            },
        ],
    },
}
