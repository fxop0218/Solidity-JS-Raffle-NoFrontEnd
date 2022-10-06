// Auto verificate contracts when they are deployed
const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    console.log("Verifying contract")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        }) // Do the same has the yarn hardhat --verify
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified")
        } else {
            console.log(error)
        }
    }
}

module.exports = { verify }
