import { ethers } from 'hardhat'
import { EntryPoint } from '../typechain'

const deployEntryPoint = async function () {
  const provider = ethers.provider
  const from = await provider.getSigner().getAddress()
  const network = await provider.getNetwork()
  
  // Sepoila Testnet üzerinde test etmek için kapattım
  // if (network.chainId !== 31337) {
  //   // Only one instance required on each chain.
  //   // Her bir evm'de sadece bir örnek yeterli
  //   return
  // }

  let factory = await ethers.getContractFactory("EntryPoint")
  const ret = await factory.deploy() as EntryPoint
  
  console.log('==entrypoint addr=', ret.address)
  return ret
}


export default deployEntryPoint
