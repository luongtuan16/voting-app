// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Ballot
 * @dev Implements voting process along with vote delegation
 */
contract Ballot {
    struct Voter {
        uint256 weight; // weight is accumulated by delegation
        bool voted; // if true, that person already voted
        address delegate; // person delegated to
        uint256 votedProposal; // index of the voted proposal
    }

    struct Proposal {
        string name;
        uint256 voteCount; // number of accumulated votes
    }

    address public chairperson;

    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    address[] public votersAddress;

    enum PHASE {
        registering,
        voting,
        end
    }

    PHASE public state;

    event EventAddProposal(uint256 index, string name);

    modifier onlyChairPerson() {
        require(msg.sender == chairperson, "Not chairperson.");
        _;
    }

    constructor() {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
    }

    function addProposal(string memory name) public onlyChairPerson {
        uint256 index = proposals.length;
        proposals.push(Proposal({name: name, voteCount: 0}));
        emit EventAddProposal(index, name);
    }

    function changePhase(PHASE x) public onlyChairPerson {
        require(x > state, "Can't move to previous phase");
        state = x;
    }

    /**
     * @dev Give 'voter' the right to vote on this ballot. May only be called by 'chairperson'.
     * @param voter address of voter
     */
    function giveRightToVote(address voter) public onlyChairPerson {
        require(!voters[voter].voted, "The voter already voted.");
        require(
            voters[voter].weight == 0,
            "The voter already has right to vote."
        );
        voters[voter].weight = 1;
        votersAddress.push(voter);
    }

    /**
     * @dev Delegate your vote to the voter 'to'.
     * @param to address to which vote is delegated
     */
    function delegate(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in delegation.");
        }
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            // If the delegate already voted,
            // directly add to the number of votes
            proposals[delegate_.votedProposal].voteCount += sender.weight;
        } else {
            // If the delegate did not vote yet,
            // add to her weight.
            delegate_.weight += sender.weight;
        }
    }

    /**
     * @dev Give your vote (including votes delegated to you) to proposal 'proposals[proposal].name'.
     * @param proposal index of proposal in the proposals array
     */
    function vote(uint256 proposal) public {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.votedProposal = proposal;

        // If 'proposal' is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        proposals[proposal].voteCount += sender.weight;
    }

    function getProposals() public view returns (Proposal[] memory) {
        return proposals;
    }

    function getAllVoters() public view returns (address[] memory) {
        return votersAddress;
    }

    /**
     * @dev Computes the winning proposal taking all previous votes into account.
     * @return winningProposal_ index of winning proposal in the proposals array
     */
    function winningProposal() public view returns (uint256 winningProposal_) {
        uint256 winningVoteCount = 0;
        for (uint256 p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    /**
     * @dev Calls winningProposal() function to get the index of the winner contained in the proposals array and then
     * @return winnerName_ the name of the winner
     */
    function winnerName() public view returns (string memory winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}
