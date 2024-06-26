// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IEntryPoint} from "account-abstraction/interfaces/IEntryPoint.sol";
import {SimpleAccountContract} from "./Dummy.sol";

contract FactoryContract {
    SimpleAccountContract public immutable walletImplementation;

    constructor(IEntryPoint entryPoint) {
        walletImplementation = new SimpleAccountContract(entryPoint, address(this));
    }

}
