/// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;




contract YourContract {
    struct Voter {
        uint weight;
        bool voted;
        address delegate;
        uint delegatedWeight;
        uint vote;
    }
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }
    address public chairperson;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    bool votingStarted = false;
    bool votingEnded = false;

    modifier ifVotingContinues {
        require(votingStarted && !votingEnded, "Voting is not active!");
        _;
    }

    modifier chairpersonOnly {
      require(msg.sender == chairperson, "Only chairperson can do that");
      _;
    }

    constructor(address chairpersonAddress, uint chairpersonWeight) {
        chairperson = chairpersonAddress;
        voters[chairperson].weight = chairpersonWeight;
    }

    function setProposals(bytes32[] memory proposalNames) public chairpersonOnly {
        require(!votingStarted, "Cannot change proposals after voting started!");
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function giveRightToVote(address voter, uint weight) external chairpersonOnly {
        require(
            !voters[voter].voted,
            "The voter already voted."
        );
        require(voters[voter].weight == 0);
        voters[voter].weight = weight;
    }

    function startVoting() public chairpersonOnly {
        require(!(votingStarted || votingEnded || proposals.length == 0));
        votingStarted = true;
    }

    function endVoting() public chairpersonOnly ifVotingContinues{
        votingEnded = true;
    }


    function delegate(address to, uint weight) external ifVotingContinues {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "You have no right to vote");
        require(!sender.voted, "You already voted.");
        require(to != msg.sender, "Self-delegation is disallowed.");
        require(weight <= sender.weight, "You can't delegate more than you have");
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
            require(to != msg.sender, "Found loop in delegation.");
        }


        Voter storage delegate_ = voters[to];
        require(delegate_.weight >= 1);
        sender.voted = true;
        sender.delegate = to;


        if (delegate_.voted) {
            proposals[delegate_.vote].voteCount += weight;
        } else {
            delegate_.weight += weight;
        }
        sender.delegatedWeight += weight;
        sender.weight -= weight;
    }

    function revokeDelegation() external ifVotingContinues {
        Voter storage sender = voters[msg.sender];
        require(sender.delegate != address(0), "There's no delegation yet.");
        Voter storage delegate_ = voters[sender.delegate];
        require(!delegate_.voted, "Delegate had already voted. You cannot revoke delegation.");
        delegate_.weight -= sender.delegatedWeight;
        sender.weight += sender.delegatedWeight;
        sender.delegatedWeight = 0;
        sender.delegate = address(0);
        sender.voted = false;
    }


    function vote(uint proposal) external ifVotingContinues {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += sender.weight;
    }




    function winningProposal() public view returns (uint winningProposal_){
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }


    function winnerName() external view returns (bytes32 winnerName_){
        winnerName_ = proposals[winningProposal()].name;
    }
}
