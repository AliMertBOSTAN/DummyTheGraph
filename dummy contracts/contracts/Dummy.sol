// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleAccountContract {
    address public owner;
    uint public initialValue;
    address public subscribed;
    address public fAddress;


    event ValueChanged(uint newValue);

    struct Swap {
        address tokenBuy;
        address tokenSell;
        uint128 value;
        uint128 timestamp;
    }

    event swapExecuted(Swap newSwap);

    constructor(uint _initialValue, address _owner, address _subscribed) payable {
        owner = _owner;
        initialValue = _initialValue;
        subscribed = _subscribed;
        fAddress = address(this);
    }


    function setVariable(uint newValue) public {
        initialValue = newValue;
        emit ValueChanged(newValue);
    }

    function getVariable() public view returns (uint) {
        return initialValue;
    }

    function doSwap(address tokenBuy, address tokenSell, uint128 value, uint128 timestamp) public {
        emit swapExecuted(Swap(tokenBuy, tokenSell, value, timestamp));
    }


}
