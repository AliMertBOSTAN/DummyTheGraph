"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = __importDefault(require("hardhat"));
const ethers_1 = require("ethers");
const { ethers } = hardhat_1.default;
async function main() {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const override = { gasPrice: ethers_1.BigNumber.from("10").pow(9).mul(2), gasLimit: 6000000 };
    let factory = await ethers.getContractFactory("FactoryContract");
    let FactoryContract = await factory.deploy(override);
    await FactoryContract.createContract("132132132", "0x1111111111111111111111111111111111111111");
    let get_addres = FactoryContract.getDeployedContracts();
    console.log(await get_addres);
    const _dummy = await get_addres;
    const test = _dummy[0];
    factory = await ethers.getContractFactory("SimpleAccountContract");
    let dummy = await factory.attach(test);
    await dummy.setVariable(123123);
    await dummy.doSwap("0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210", 213213213, currentTimestampInSeconds);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
