import hre from "hardhat";
import { ContractFactory, BytesLike, BigNumber, Signer } from 'ethers';
import { FactoryContract } from "../typechain";
import { SimpleAccountContract } from "../typechain"
import { get } from "http";


const { ethers } = hre;


async function main() {
  console.log("1")
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const override = { gasPrice: BigNumber.from("10").pow(9).mul(2), gasLimit: 6000000}
  
  console.log("2")
  let factory = await ethers.getContractFactory("FactoryContract")
  let FactoryContract = await factory.attach("0x0Ebd85C763089a67d19dd3A85E02c19374e0EF3c") as FactoryContract
  
  console.log("3")
  // await FactoryContract.createContract("1597532684","0x3333333333333333333333333333333333333333")
  // console.log("4")
  // let get_addres = await FactoryContract.
  // console.log("5")
  
  // console.log(get_addres)
  
  // const _dummy = get_addres
  // const test = _dummy[0]
  
  // console.log("6")
  factory = await ethers.getContractFactory("SimpleAccountContract")
  let dummy = await factory.attach("0xa60ca55719cde486214b1c81435c451f2c540e15") as SimpleAccountContract
  await dummy.setVariable(321321)
  await dummy.doSwap("0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210", 963852741, currentTimestampInSeconds)
  // console.log("7")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.log("6")
  console.error(error);
  process.exitCode = 1;
});
