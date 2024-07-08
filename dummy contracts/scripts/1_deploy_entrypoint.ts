import { ethers } from 'hardhat'
import { EntryPoint } from '../typechain'

const deployEntryPoint = async function () {
  const provider = ethers.provider
  const from = await provider.getSigner().getAddress()
  
  let factory = await ethers.getContractFactory("EntryPoint")
  const ret = await factory.deploy() as EntryPoint
  
  console.log('==entrypoint addr=', ret.address)
  return ret
}


export default deployEntryPoint
