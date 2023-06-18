// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import hre from "hardhat";

const [theDefaultDeployer, acc2, acc3] = await hre.ethers.getSigners();
const currentTimestampInSeconds = Math.round(Date.now() / 1000);
const unlockTime = currentTimestampInSeconds + 60;

const lockedAmount = hre.ethers.utils.parseEther("0.001");

// const Lock = await hre.ethers.getContractFactory("Lock");
// const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

// await lock.deployed();
// console.log(
//   `Lock with ${hre.ethers.utils.formatEther(
//     lockedAmount
//   )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
// );

const Ballot = await hre.ethers.getContractFactory("Ballot");
const ballot = await Ballot.connect(acc3).deploy();

console.log(
  `Ballot with ${hre.ethers.utils.formatEther(
    lockedAmount
  )}ETH and unlock timestamp ${unlockTime} deployed to ${ballot.address} from ${await ballot.signer.getAddress()}`
);
await ballot.deployed();

