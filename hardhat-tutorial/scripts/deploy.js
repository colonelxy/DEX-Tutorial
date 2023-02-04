const {ethers} = require("hardhat");
require("dotenv").config({path: ".env"});
const {TOKEN_CONTRACT_ADDRESS} = require("../constants");

async function main() {
  const cryptoDevTokenAddress = TOKEN_CONTRACT_ADDRESS;
  const exchangeContract  =await ethers.getContractFactory("Exchange");

  const deployedExchangeContract = await exchangeContract.deploy(cryptoDevTokenAddress);

  await deployedExchangeContract.deployed();

  console.log("Exchange Contract Address is: ", deployedExchangeContract.address);
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});