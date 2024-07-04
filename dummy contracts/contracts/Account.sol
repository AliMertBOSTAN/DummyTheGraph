// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IEntryPoint} from "./interfaces/IEntryPoint.sol";
import {BaseAccount} from "./core/BaseAccount.sol";
import {PackedUserOperation} from "./interfaces/PackedUserOperation.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {TokenCallbackHandler} from "./samples/callback/TokenCallbackHandler.sol";
import "./core/Helpers.sol";

contract SimpleAccountContract is BaseAccount, Initializable, UUPSUpgradeable, TokenCallbackHandler {
    address public immutable walletFactory;
    IEntryPoint private immutable _entryPoint;
    using ECDSA for bytes32;
    address[] public owners;

    event WalletInitialized(IEntryPoint indexed entryPoint, address[] owners);

    constructor(IEntryPoint anEntryPoint, address ourWalletFactory) {
        _entryPoint = anEntryPoint;
        walletFactory = ourWalletFactory;
    }

    modifier _requireFromEntryPointOrFactory() {
        require(
            msg.sender == address(_entryPoint) || msg.sender == walletFactory,
            "only entry point or wallet factory can call"
        );
    _;
}

    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    function _authorizeUpgrade(
        address
    ) internal view override _requireFromEntryPointOrFactory {}

    // _validateSignature verilen bir akıllı kontrat cüzdanının tüm sahiplerinin imzalarını doğrulamak için kullanılır.
    function _validateSignature(
        PackedUserOperation calldata userOp, // UserOperation veri yapısı girdi olarak geçirildi.
        bytes32 userOpHash // UserOperation'ın hash'i ama imza olmadan.
    ) internal view override returns (uint256) {
        // userOpHash'ı Ethereum Signed Message Hash'e çevirilmesi.
       bytes32 hash = MessageHashUtils.toEthSignedMessageHash(userOpHash);

        // imzanın userOp'dan decode edilmesi ve array olarak memory kayıt edilmesi.
        bytes[] memory signatures = abi.decode(userOp.signature, (bytes[]));

        for (uint256 i = 0; i < owners.length; i++) {
            // Her imzadan imzalayanın adresini kurtar.
            // Kurtarılan adres sahibin adresiyle eşleşmiyorsa, SIG_VALIDATION_FAILED değerini döndür.
            if (owners[i] != hash.recover(signatures[i])) {
                return SIG_VALIDATION_FAILED;
            }
        }
        // Eğer tüm imzalar geçerli ise (yani hepsi sahiplerine aitse), 0 değerini döndür.
        return 0;
    }

    function initialize(address[] memory initialOwners) public initializer {
        _initialize(initialOwners);
    }

    function _initialize(address[] memory initialOwners) internal {
        require(initialOwners.length > 0, "no owners");
        owners = initialOwners;
        emit WalletInitialized(_entryPoint, initialOwners);
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                // Burada stack'te bulunan son verinin ilk 32 byte'ını atlar; bu kısım verinin uzunluğunu içerir.
                // Ardından mload kullanarak gerçek hata mesajını yükler ve bu hata mesajıyla revert çağrısı yapar.
                revert(add(result, 32), mload(result))
            }
        }
    }
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external _requireFromEntryPointOrFactory {
        _call(dest, value, func);
    }

    function executeBatch(
        address[] calldata dests,
        uint256[] calldata values,
        bytes[] calldata funcs
    ) external _requireFromEntryPointOrFactory {
        require(dests.length == funcs.length,"Wrong dests length");
        require(values.length == funcs.length, "Wrong values length");
        for (uint256 i = 0; i < dests.length; i++) {
            _call(dests[i], values[i], funcs[i]);
        }
    }

    // encodeSignatures, imzaları bir byte dizisine kodlar. Bu byte dizisi, sözleşmeye çağrı yaparken veri olarak geçirilebilir.
    function encodeSignatures(
        bytes[] memory signatures
    ) public pure returns (bytes memory) {
        return abi.encode(signatures);
    }

    // getDeposit, EntryPoint içindeki Cüzdanın bakiyesini kontrol eder.
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    receive() external payable {}
}
