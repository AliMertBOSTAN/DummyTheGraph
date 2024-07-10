import { ethers } from "hardhat";
async function ApproveAndSwap(token: string, to: string, value: string): Promise<any[]> {
    const ERC20_ABI = require("./erc20.abi.json");
    const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/a3ea7aca6fce4e6fa10a72aaf978f409");
    const erc20 = new ethers.Contract(token, ERC20_ABI, provider);
    const decimals = await Promise.all([erc20.decimals()]);
    const amount = ethers.utils.parseUnits(value, decimals);

    const approve = {
      to: token,
      value: ethers.constants.Zero,
      data: erc20.interface.encodeFunctionData("approve", [to, amount]),
    };

    const send = {
      to: token,
      value: ethers.constants.Zero,
      data: erc20.interface.encodeFunctionData("transfer", [to, amount]),
    };

  return [approve, send];
}

export default ApproveAndSwap