const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
require("@nomicfoundation/hardhat-chai-matchers")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit test", async () => {
          let raffle, raffleEntranceFee, deployer

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })
          describe("fulfillRandomWords", () => {
              it("works with live chainlink keepers ans chainlink vrf, we get a roandom winner", async () => {
                  const startingTimeStamp = await raffle.getLatesTimeSnap()
                  const accounts = await ethers.getSigners()
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fride")
                          resolve()
                          try {
                              // asserts
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLatesTimeSnap()
                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )
                              assert(endingTimeStamp > startingTimeStamp)
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })
                      // Thne entering the raffle
                      await raffle.entranceFee({ value: raffleEntranceFee })
                      const winnerStartingBalance = await accounts[0].getBalance()
                      // and this code WONT complete intil our listener has finished listennig
                  })
              })
          })
      })
