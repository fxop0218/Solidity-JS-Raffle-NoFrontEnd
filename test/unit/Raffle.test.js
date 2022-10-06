const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
require("@nomicfoundation/hardhat-chai-matchers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit test", async () => {
          let raffle, vrfCoordinatorV2Mock
          const chainId = network.config.chainId

          beforeEach(async () => {
              accounts = await ethers.getSigners() // get all the accounts
              // const { deploy } = await getNamedAccounts() // exemple with getNamedAccounts
              deployer = accounts[0] // get the deployer
              player = accounts[1] // get a normal player
              await deployments.fixture(["all"]) // Deploys modules with the tags "mocks" and "raffle"
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock") // Connect to VRFCoordinatorV2Mock
              raffleContract = await ethers.getContract("Raffle") // Connect to the Raffle
              raffle = raffleContract.connect(player) // Returns a new instance of the Raffle contract connected to player
              raffleEntranceFee = await raffle.getEntranceFee()
              interval = await raffle.getInterval()
          })

          describe("constructor", function () {
              it("initializes the raffle correctly", async () => {
                  // Ideally, we'd separate these out so that only 1 assert per "it" block
                  // And ideally, we'd make this check everything
                  const raffleState = (await raffle.getRaffleState()).toString()
                  console.log(raffleState)
                  // Comparisons for Raffle initialization:
                  assert.equal(raffleState, "0")
                  assert.equal(
                      interval.toString(),
                      networkConfig[network.config.chainId]["keepersUpdateInterval"]
                  )
              })
          })

          // When is revert error raised by smartcontrac, its needed this new requeriment require("@nomicfoundation/hardhat-chai-matchers")
          describe("Enter to raffle", async () => {
              it("Revert when the player don't pay enough", async () => {
                  await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
                      // is reverted when not paid enough or raffle is not open
                      raffle,
                      "Raffle_NotEnoughEthEnterd"
                  )
              })
          })
      })
