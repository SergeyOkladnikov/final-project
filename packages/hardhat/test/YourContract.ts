import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let yourContract: YourContract;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const yourContractFactory = await ethers.getContractFactory("YourContract");
    yourContract = (await yourContractFactory.deploy(owner, 5)) as YourContract;
    await yourContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy correctly", async function () {
      const [owner] = await ethers.getSigners();
      expect(await yourContract.chairperson()).to.equal(owner);
    });

    it("Should allow setting proposals pre-voting", async function () {
      const proposals = ["0x6f6e650000000000000000000000000000000000000000000000000000000000","0x74776f0000000000000000000000000000000000000000000000000000000000"]
      await yourContract.setProposals(proposals);
      expect((await yourContract.proposals(0)).name).to.equal(proposals[0]);
      expect((await yourContract.proposals(1)).name).to.equal(proposals[1]);
      
      await yourContract.startVoting()
      await expect(yourContract.setProposals(proposals)).to.be.revertedWith('Cannot change proposals after voting started!');
    });

    it("Should allow voting to rightful voters", async function () {
      const [owner, voter1] = await ethers.getSigners();
      await expect(yourContract.connect(voter1).vote(1)).to.be.revertedWith('Has no right to vote');
      await yourContract.connect(owner).giveRightToVote(voter1, 3);
      await yourContract.connect(voter1).vote(1);
      expect((await yourContract.proposals(1)).voteCount).to.equal(3);
    });

    it("Should allow delegation correctly", async function () {
      const [owner, voter1, voter2, voter3, voter4] = await ethers.getSigners();
      await yourContract.connect(owner).giveRightToVote(voter2, 5);
      await yourContract.connect(owner).giveRightToVote(voter3, 5);
      await yourContract.connect(owner).giveRightToVote(voter4, 5);
      
      await expect(yourContract.connect(voter1).delegate(voter2, 1)).to.be.revertedWith('You already voted.');
      await expect(yourContract.connect(voter2).delegate(voter3, 6)).to.be.revertedWith("You can't delegate more than you have");
      await yourContract.connect(voter2).delegate(voter3, 4);
      expect((await yourContract.voters(voter3)).weight).to.equal(9);
      await yourContract.connect(voter3).delegate(voter4, 4);
      await expect(yourContract.connect(voter2).revokeDelegation()).to.be.revertedWith("Delegate had already voted. You cannot revoke delegation.");
      await yourContract.connect(voter3).revokeDelegation()
      await yourContract.connect(voter2).revokeDelegation()
      expect((await yourContract.voters(voter2)).weight).to.equal(5);
      expect((await yourContract.voters(voter2)).delegatedWeight).to.equal(0);
    });

    it("Should respect access rights", async function () {
      const [owner, voter1, voter2, voter3, voter4, voter5] = await ethers.getSigners();
      await expect(yourContract.connect(voter1).giveRightToVote(voter5, 5)).to.be.revertedWith("Only chairperson can do that");
      await expect(yourContract.connect(voter1).setProposals(["0x6f6e650000000000000000000000000000000000000000000000000000000000","0x74776f0000000000000000000000000000000000000000000000000000000000"]))
      .to.be.revertedWith("Only chairperson can do that");
      await expect(yourContract.connect(voter1).startVoting()).to.be.revertedWith("Only chairperson can do that");
      await expect(yourContract.connect(voter1).endVoting()).to.be.revertedWith("Only chairperson can do that");
      await yourContract.endVoting()
      await expect(yourContract.connect(voter1).vote(1)).to.be.revertedWith("Voting is not active!");
      await expect(yourContract.connect(voter1).delegate(voter2, 1)).to.be.revertedWith("Voting is not active!");
    });
  });
});
