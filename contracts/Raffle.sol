// SPDX-License-Identifier: MIT

/* Pragma */
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

/* Imports */
error Raffle_NotEnoughEthEnterd();
error Raffle__NotOpened();
error Raffle__transferFailed();
error Raffle_UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);

/**
s_ ==> storage
i_ ==> imutable
 */

/** @title Sample raffle smart contract
 *  @author Francesc Oliveras (fxop0218)
 *  @notice Contract is for creating an untemperable decentraliced smart contract
 *  @dev This impllements VRF v2 and keepers from chainlink
 */

/* Contract */
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    enum RaffleState {
        OPEN,
        CALCULATING
    }
    /* State variables */
    uint256 private immutable i_entranceFee;
    address payable[] private s_lotteryPlayers;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLine;
    uint64 private immutable i_subscriptionId;
    uint32 private constant NUM_WORDS = 1;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFITMATIONS = 3;

    /* Raffle var */
    address private s_recentWinner;
    RaffleState private s_raffleState;
    uint256 private immutable i_interval;
    uint256 private immutable i_lastTimeStamp;

    /* Events */
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed recentWinner);

    /* Constructor */
    constructor(
        address vrfCordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLine,
        uint256 interval,
        uint256 entranceFee,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCordinatorV2);
        i_gasLine = gasLine;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        i_lastTimeStamp = interval;
        i_interval = interval;
    }

    /* Functions */
    function enterRaffle() public payable {
        // Anyone can enter the raffle (public) and is needed pay (payable)
        // require(msg.value > i_entranceFee); gass not efficient
        if (msg.value < i_entranceFee) {
            revert Raffle_NotEnoughEthEnterd();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpened();
        }
        s_lotteryPlayers.push(payable(msg.sender));
        // Events
        emit RaffleEnter(msg.sender);
    }

    function checkUpkeep(
        bytes memory /*checkData*/ // Change calldata to memory if raises error
    )
        public
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* Perform data */
        )
    {
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        bool timePassed = ((block.timestamp - i_lastTimeStamp) > i_interval);
        bool hasPlayers = (s_lotteryPlayers.length > 0);
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
        return (upkeepNeeded, "0x0");
        // (block.timestamp - last block timestamp) > interval
    }

    function performUpkeep(
        bytes calldata /*performdata*/
    ) external override {
        // after this function is called selectRandomWinner
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle_UpkeepNotNeeded(
                address(this).balance,
                s_lotteryPlayers.length,
                uint256(s_raffleState)
            );
        }
        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLine,
            i_subscriptionId,
            REQUEST_CONFITMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestedRaffleWinner(requestId);
    }

    function fulfillRandomWords(
        uint256, /*requestId*/
        uint256[] memory randomWords
    ) internal override {
        // Use modular operation s_lotteryPlayers = 10 -- randomNumber = 327678
        // 327678 % 10 = 8
        uint256 indexOfWinner = randomWords[0] % s_lotteryPlayers.length;
        address payable winner = s_lotteryPlayers[indexOfWinner];
        s_lotteryPlayers = new address payable[](0);
        s_recentWinner = winner;
        s_raffleState = RaffleState.OPEN;
        (bool success, ) = winner.call{value: address(this).balance}("");

        if (!success) {
            revert Raffle__transferFailed();
        }
        emit WinnerPicked(winner);
    }

    /**
     * @dev This is the function that the chainlink keeper nodes call
     * they look the "upkeepNeeded to return true
     *
     */

    /* Getters */

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_lotteryPlayers[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        // becuase get from memory == Pure
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_lotteryPlayers.length;
    }

    function getLatesTimeSnap() public view returns (uint256) {
        return i_lastTimeStamp;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}
