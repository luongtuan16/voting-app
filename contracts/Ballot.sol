// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Ballot {
    struct Voter {
        address addr;
        string name;
        string avatar;
        uint256 weight; // weight
        bool voted; // if true, that person already voted
        uint256 votedProposal; // index of the voted proposal
    }

    struct Proposal {
        uint256 id;
        string name;
        string avatar;
        uint256 voteCount; // number of accumulated votes
    }

    enum PHASE {
        init,
        registering,
        voting,
        end
    }

    address public chairperson;
    address[] public votersAddress;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    PHASE public phase;
    string public title;

    event EventAddProposal(uint256 index, string name);

    modifier onlyChairPerson() {
        require(msg.sender == chairperson, "Not chairperson.");
        _;
    }

    constructor(string memory _title) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        title = _title;
    }

    function addProposal(
        uint256 id,
        string memory name,
        string memory avatar
    ) public onlyChairPerson {
        require(phase == PHASE.init, "Can't add proposals at this phase");
        uint256 i = 0;
        for (i; i < proposals.length; i++) if (proposals[i].id == id) break;
        require(i == proposals.length, "Proposal existed");
        uint256 index = proposals.length;
        proposals.push(
            Proposal({id: id, name: name, avatar: avatar, voteCount: 0})
        );
        emit EventAddProposal(index, name);
    }

    function changePhase(PHASE x) public onlyChairPerson {
        require(x > phase, "Can't move to previous phase");
        phase = x;
    }

    function giveRightToVote(
        address voter,
        string memory name,
        string memory avatar
    ) public onlyChairPerson {
        require(phase < PHASE.voting, "Can't add voters at this phase");
        require(
            voters[voter].weight == 0,
            "The voter already has right to vote."
        );
        if (bytes(voters[voter].name).length == 0) {
            voters[voter].name = name;
        }
        if (bytes(voters[voter].avatar).length == 0) {
            voters[voter].avatar = avatar;
        }
        voters[voter].weight = 1;
        voters[voter].addr = voter;
        uint256 i = 0;
        for (i; i < votersAddress.length; i++)
            if (votersAddress[i] == voter) break;
        if (i == votersAddress.length) votersAddress.push(voter);
    }

    function registerVoter(string memory name, string memory avatar) public {
        require(phase == PHASE.registering, "Can't register at this phase");
        require(
            voters[msg.sender].weight == 0,
            "The voter already has right to vote."
        );
        votersAddress.push(msg.sender);
        voters[msg.sender].name = name;
        voters[msg.sender].avatar = avatar;
        voters[msg.sender].addr = msg.sender;
    }

    function vote(uint256 id) public {
        require(phase == PHASE.voting, "Can't give vote at this phase");
        Voter storage sender = voters[msg.sender];
        uint256 proposal;
        for (proposal; proposal < proposals.length; proposal++)
            if (proposals[proposal].id == id) break;
        require(proposal < proposals.length, "Proposal not exist");
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.votedProposal = proposal;
        proposals[proposal].voteCount += sender.weight;
    }

    function validateChairperson() public view returns (bool isChairperson) {
        return msg.sender == chairperson;
    }

    function getVoterStatus() public view returns (uint256 status) {
        uint256 i = 0;
        for (i; i < votersAddress.length; i++)
            if (votersAddress[i] == msg.sender) break;
        if (i == votersAddress.length) status = 0;
        else if (voters[votersAddress[i]].weight == 0) status = 1;
        else if (!voters[votersAddress[i]].voted) status = 2;
        else status = 3;
    }

    function getProposals() public view returns (Proposal[] memory) {
        return proposals;
    }

    function getAllVoters() public view returns (address[] memory) {
        return votersAddress;
    }

    function getBallotInfo()
        public
        view
        returns (
            address _chairperson,
            string memory _title,
            PHASE _phase,
            uint256 totalProposals,
            uint256 totalVoters,
            uint256 totalRegistrations
        )
    {
        _chairperson = chairperson;
        _title = title;
        _phase = phase;
        totalProposals = proposals.length;
        totalRegistrations = 0;
        for (uint256 i = 0; i < votersAddress.length; i++)
            if (voters[votersAddress[i]].weight == 0) totalRegistrations++;
        totalVoters = votersAddress.length - totalRegistrations;
    }

    function getRegisteringVoters()
        public
        view
        onlyChairPerson
        returns (Voter[] memory)
    {
        Voter[] memory _voters = new Voter[](votersAddress.length);
        uint256 idx = 0;
        for (uint256 i = 0; i < votersAddress.length; i++)
            if (voters[votersAddress[i]].weight == 0) {
                _voters[idx] = voters[votersAddress[i]];
                idx++;
            }
        return _voters;
    }

    function getValidVoters()
        public
        view
        onlyChairPerson
        returns (Voter[] memory)
    {
        Voter[] memory _voters = new Voter[](votersAddress.length);
        uint256 idx = 0;
        for (uint256 i = 0; i < votersAddress.length; i++)
            if (voters[votersAddress[i]].weight == 1) {
                _voters[idx] = voters[votersAddress[i]];
                idx++;
            }
        return _voters;
    }

    function winningProposal() public view returns (uint256 winningProposal_) {
        require(phase == PHASE.end, "Ballot has not finished yet");
        uint256 winningVoteCount = 0;
        for (uint256 p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function getWinner() public view returns (Proposal memory winner) {
        require(phase == PHASE.end, "Ballot has not finished yet");
        winner = proposals[winningProposal()];
    }
}
