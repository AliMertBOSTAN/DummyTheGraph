// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Dummy.sol";

contract FactoryContract {
    SimpleAccountContract[] public deployedContracts;

    event ContractCreated(address indexed newContract, address indexed creator);

    function createContract(uint initialValue, address _subscriber) public {
        SimpleAccountContract newContract = new SimpleAccountContract(initialValue, msg.sender, _subscriber);
        deployedContracts.push(newContract);
        emit ContractCreated(address(newContract), msg.sender);
    }

}
