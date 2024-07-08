import hre from "hardhat";
import { ContractFactory, BytesLike, BigNumber, Signer } from 'ethers';
import deployEntryPoint from "./1_deploy_entrypoint";
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { FactoryContract, SimpleAccount } from "../typechain";

const { ethers } = hre;

interface Addrs {
  EntryPoint: string | undefined,
  Factory: string | undefined
}

let addrs : Addrs = {
  EntryPoint: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  Factory: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"
}

const deploySimpleAccountFactory = async function (): Promise<FactoryContract | undefined> {
  const provider = ethers.provider
  const from = await provider.getSigner().getAddress()
  const network = await provider.getNetwork()
  let ret = undefined

  if(addrs.EntryPoint !== undefined){
    let factory = await ethers.getContractFactory("FactoryContract")
    ret =addrs.Factory ? factory.attach(addrs.Factory) as FactoryContract : await factory.deploy(addrs.EntryPoint) as FactoryContract
    addrs.Factory = ret.address
    console.log("Factory Address == ", ret.address)
  }

  return ret
}

async function main() {
  let res
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const override = { gasPrice: BigNumber.from("10").pow(9).mul(2), gasLimit: 6000000}
  
  if(addrs.EntryPoint == undefined){
    let EP = await deployEntryPoint()
    addrs.EntryPoint = EP.address
  }


  const EP = await deploySimpleAccountFactory()

  res = await EP?.createAccount(["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"], 1138)
  console.log(res)

  res = await EP?.getAddress(["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"], 1138)
  console.log(res) // => 0xB6C28A042132fE1D008B35Dcf1058f8a94b159Dc

  let factory = await ethers.getContractFactory("SimpleAccountContract")
  const Account = factory.attach("0xB6C28A042132fE1D008B35Dcf1058f8a94b159Dc") as SimpleAccount

  res = await Account.entryPoint()
  console.log(res)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
