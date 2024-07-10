import hre from "hardhat";
import { ContractFactory, BytesLike, BigNumber, Signer } from 'ethers';
import deployEntryPoint from "./1_deploy_entrypoint";
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { FactoryContract, SimpleAccount } from "../typechain";
import { randomBytes } from "crypto";
import { UserOperationBuilder } from "userop";
import ApproveAndSwap from "./2_ERC20_ApproveAndSwap";
import { defaultAbiCoder } from "ethers/lib/utils";
import { BUNDLER_RPC_URL, WALLET_FACTORY_ADDRESS } from "./utils/constants";
import {
  entryPointContract,
  getWalletContract,
  walletFactoryContract,
} from "./utils/getContracts";
import { concat } from "ethers/lib/utils";
import { Client, Presets } from "userop";
import { getUserOperationBuilder } from "./getUserOperationBuilder";

const { ethers } = hre;
export type hex = `0x${string}`;
const rpcUrl ="https://public.stackup.sh/api/v1/node/ethereum-sepolia";
const paymasterUrl = "";
// const paymasterUrl = "https://api.stackup.sh/v1/paymaster/6eb60d356522f7850254e778949c6aea1380bad219f6a30f117f6b506a5e0344";
const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/a3ea7aca6fce4e6fa10a72aaf978f409");

interface Addrs {
  EntryPoint: string | undefined,
  Factory: string | undefined,
  usdc: string
}

interface UserOperation {
  sender: any;
  nonce: bigint;
  initCode: hex;
  callData: hex;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: hex;
  signature: hex;
}

let addrs : Addrs = {
  EntryPoint: "0x460779446e910e7286231901d1B02E4349eB5249",
  Factory: "0x624bd19c949330cD567E2Db4053ddf5369c00f34",
  usdc: "0x60bBA138A74C5e7326885De5090700626950d509"
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
    console.log("Factory Address: ", ret.address)
  }

  return ret
}

async function getUserOperationBuilder(
  walletContract: string,
  nonce: BigNumber,
  initCode: Uint8Array,
  encodedCallData: string,
  signatures: string[]
) {
  try {
    // Encode our signatures into a bytes array
    const encodedSignatures = defaultAbiCoder.encode(["bytes[]"], [signatures]);

    // Use the UserOperationBuilder class to create a new builder
    // Supply the builder with all the necessary details to create a userOp
    const builder = new UserOperationBuilder()
      .useDefaults({
        preVerificationGas: 100_000,
        callGasLimit: 100_000,
        verificationGasLimit: 2_000_000,
      })
      .setSender(walletContract)
      .setNonce(nonce)
      .setCallData(encodedCallData)
      .setSignature(encodedSignatures)
      .setInitCode(initCode);

    return builder;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

async function getUserOpForETHTransfer(
  walletAddress: string,
  owners: string[],
  salt: string,
  toAddress: string,
  value: BigNumber,
  isDeployed?: boolean
) {
  try {
    let initCode = Uint8Array.from([]);
    if (!isDeployed) {
      // Encode the function data for creating a new account
      const data = walletFactoryContract.interface.encodeFunctionData(
        "createAccount",
        [owners, salt]
      );
      // Initialize the initCode which will be used to deploy a new wallet
      initCode = concat([WALLET_FACTORY_ADDRESS, data]);
    }

    // Get the nonce for the wallet address with a key of 0
    const nonce: BigNumber = await entryPointContract.getNonce(
      walletAddress,
      0
    );

    // Get the wallet contract instance
    const walletContract = getWalletContract(walletAddress);
    // Encode the call data for the execute method
    const encodedCallData = walletContract.interface.encodeFunctionData(
      "execute",
      [toAddress, value, initCode]
    );

    // Get the user operation builder with the necessary parameters
    const builder = await getUserOperationBuilder(
      walletContract.address,
      nonce,
      initCode,
      encodedCallData,
      []
    );

    // Use middleware to set the current gas prices
    builder.useMiddleware(Presets.Middleware.getGasPrice(provider));

    // Initialize a client to connect to the Bundler
    const client = await Client.init(BUNDLER_RPC_URL);
    // Build the user operation using the builder
    await client.buildUserOperation(builder);
    // Retrieve the user operation
    const userOp = builder.getOp();

    // Return the final user operation
    return userOp;
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      window.alert(e.message);
    }
  }
}

async function main() {
  let res
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const override = { gasPrice: BigNumber.from("10").pow(9).mul(2), gasLimit: 6000000};
  const projectId = process.env.PROJECT_ID as string;
  const privateKey = process.env.SecretKey as hex;
  const AlchemyHttps = process.env.ALCHEMY_HTTPS;
  
  if(addrs.EntryPoint == undefined){
    let EP = await deployEntryPoint()
    addrs.EntryPoint = EP?.address
    console.log("Entry Point Address: ", EP?.address)
  }

  const AccountFactory = await deploySimpleAccountFactory()
  
  // const salt = "0x" + randomBytes(32).toString("hex")
  // console.log("salt: ", salt)
  // res = await AccountFactory?.createAccount(["0x01e650ABfc761C6A0Fc60f62A4E4b3832bb1178b", "0x849C8e8Ee487424475D9e8f44244275599790B16"], salt)
  // console.log(res)

  res = await AccountFactory?.getAddress(["0x01e650ABfc761C6A0Fc60f62A4E4b3832bb1178b", "0x849C8e8Ee487424475D9e8f44244275599790B16"], "0x64a54186efae105e9efdf7c6806a4bc0d139b8cc42501dbc56f2e64484d69d59")
  console.log("Account Address: ", res) // => 0x7821Dbe9208D48447f8fB81628a82FFd9de3e06b

  let factory = await ethers.getContractFactory("SimpleAccountContract")
  const Account = factory.attach(res? res : "0x7821Dbe9208D48447f8fB81628a82FFd9de3e06b") as SimpleAccount

  res = await Account.entryPoint()
  console.log("Entry Point check: ", res)

  const [approve, send] = await ApproveAndSwap(addrs.usdc, "0x427FB36C7eb1Ae5a8664807E973134EE46e0A17F", "50")

  // const userop: V06.EntryPoint.UserOperation = {
  // };

  res = await Account.execute(
    approve.to,
    approve.value,
    approve.data
  )

  console.log("Account Approve: ", res)
  res = await Account.execute(
    send.to,
    send.value,
    send.data
  )
  console.log("Account Send: ", res)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
