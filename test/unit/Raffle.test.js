const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
require("@nomicfoundation/hardhat-chai-matchers")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit test", async () => {
          let raffle, vrfCoordinatorV2Mock, interval, raffleEntranceFee, deployer
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
              it("Record players when enter", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  const _player = await raffle.getPlayer(0)
                  assert.equal(_player, player.address)
              })
              it("Emits event on enter", async () => {
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
                      raffle,
                      "RaffleEnter"
                  )
              })
              it("doesn't allow entrance when raffle is calculating", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  //  https://hardhat.org/hardhat-network/reference
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  await raffle.performUpkeep([])
                  await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith(
                      "Raffle__RaffleNotOpen"
                  )
              })
          })
          describe("checkUpkeep", async () => {
              it("Return false if people haven't sent any eth", async () => {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upKeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert(!upKeepNeeded)
              })
              it("Return false if raffle isn't opened", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  await raffle.performUpkeep([])
                  const raffleState = await raffle.getRaffleState()
                  const { upKeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert.equal(raffleState.toString(), "1")
                  assert.equal(upKeepNeeded, false)
              })
              it("reverts when checkupkeep is false", async () => {
                  await expect(raffle.performUpkeep([])).to.be.revertedWithCustomError(
                      raffle,
                      "Raffle_UpkeepNotNeeded"
                  )
              })
              it("06-updates the raffle state", async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const txResponse = await raffle.performUpkeep([])
                  const txRecipt = await txResponse.wait(1)
                  const requestId = txRecipt.events[1].args.requestId
                  assert(requestId.toNumber() > 0)
                  assert(raffleState == 0)
              })
          })
          describe("fulfillRandomWords", () => {
              beforeEach(async () => {
                  await raffle.enterRaffle({ value: raffleEntranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
              })
              it("07-Can only be called after performupkeep", async () => {
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
                  await expect(
                      vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address)
                  ).to.be.revertedWith("nonexistent request")
              })
          })
          it("picks a winner, resets, and sends money", async () => {
              const additionalEntrances = 3 // to test
              const startingIndex = 2
              for (let i = startingIndex; i < startingIndex + additionalEntrances; i++) {
                  // i = 2; i < 5; i=i+1
                  raffle = raffleContract.connect(accounts[i])
                  await raffle.enterRaffle({ value: raffleEntranceFee })
              }
              const startingTimeStamp = await raffle.getLastTimeStamp()
              await new Promise(async (resolve, reject) => {
                  raffle.once("WinnerPicked", async () => {
                      console.log("WinnerPicked event fired!")
                      try {
                          const recentWinner = await raffle.getRecentWinner()
                          const raffleState = await raffle.getRaffleState()
                          const winnerBalance = await accounts[2].getBalance()
                          const endingTimeStamp = await raffle.getLastTimeStamp()
                          await expect(raffle.getPlayer(0)).to.be.reverted
                          assert.equal(recentWinner.toString(), accounts[2].address)
                          assert.equal(raffleState, 0)
                          assert.equal(
                              winnerBalance.toString(),
                              startingBalance
                                  .add(
                                      raffleEntranceFee
                                          .mul(additionalEntrances)
                                          .add(raffleEntranceFee)
                                  )
                                  .toString()
                          )
                          assert(endingTimeStamp > startingTimeStamp)
                          resolve()
                      } catch (error) {
                          reject(error)
                      }
                  })

                  const tx = await raffle.performUpkeep("0x")
                  const txReceipt = await tx.wait(1)
                  const startingBalance = await accounts[2].getBalance()
                  await vrfCoordinatorV2Mock.fulfillRandomWords(
                      txReceipt.events[1].args.requestId,
                      raffle.address
                  )
              })
          })
      })
