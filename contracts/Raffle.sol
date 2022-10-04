// SPDX-License-Identifier: MIT

//ppragmaaram
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

error Raffle_NotEnoughEthEnterd();

/**
s_ ==> storage
i_ ==> imutable
 */
contract Raffle is VRFConsumerBaseV2 {
    // State variables
    uint256 private immutable i_entranceFee;
    address[] s_lotteryPlayers;

    // Events
    event RaffleEnter(address indexed player);

    constructor(address vrfCordinatorV2, uint256 entranceFee) VRFConsumerBaseV2(vrfCordinatorV2) {
        i_entranceFee = entranceFee;
    }

    function enterRaffle() public payable {
        // Anyone can enter the raffle (public) and is needed pay (payable)
        // require(msg.value > i_entranceFee); gass not efficient
        if (msg.value < i_entranceFee) {
            revert Raffle_NotEnoughEthEnterd();
        }
        s_lotteryPlayers.push(payable(msg.sender));
        // Events
        emit RaffleEnter(msg.sender);
    }

    function selectRandomWinner() external {
        // External cheaper that public
        // Request random number
        // 2 transaction process
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {}

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_lotteryPlayers[index];
    }
}
