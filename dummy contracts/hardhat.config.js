"use strict";
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
Object.defineProperty(exports, "__esModule", { value: true });
require("hardhat-typechain");
require("@nomiclabs/hardhat-ethers");
require("hardhat-contract-sizer");
require("@nomicfoundation/hardhat-verify");
require("hardhat-storage-layout");
require('solidity-coverage');
module.exports = {
    solidity: {
        compilers: [{
                viaIR: true,
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 2000,
                        details: {
                            yul: true,
                            yulDetails: {
                                stackAllocation: true,
                                optimizerSteps: "dhfoDgvulfnTUtnIf"
                            }
                        }
                    },
                }
            }],
        overrides: {},
    },
    networks: {
        local: {
            url: 'http://127.0.0.1:8545',
            chainId: 31337,
            accounts: ["0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"]
        },
        ganache: {
            url: 'http://127.0.0.1:7545',
            accounts: ["0x36940433d721a3351e4112c54f160c587f5b8feb94795da3dcfb67e2db206786"]
        },
        sepolia: {
            url: 'https://sepolia.infura.io/v3/a3ea7aca6fce4e6fa10a72aaf978f409',
            chainId: 11155111,
            accounts: ["0x7c5e2cfbba7b00ba95e5ed7cd80566021da709442e147ad3e08f23f5044a3d5a"]
        }
    }
};
