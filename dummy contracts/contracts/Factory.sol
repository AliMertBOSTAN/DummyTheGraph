// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IEntryPoint} from "./interfaces/IEntryPoint.sol";
import {SimpleAccountContract} from "./Dummy.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";

contract FactoryContract {
    SimpleAccountContract public immutable walletImplementation;

    constructor(IEntryPoint entryPoint) {
        walletImplementation = new SimpleAccountContract(entryPoint, address(this));
    }

    function getAddress(
        address[] memory owners,
        uint256 salt
    ) public view returns (address) {
        // Bu initialize fonksiyonunun SimpleAccountContract kontratındaki calldata'sıdır biz bunu bir byte array'e yazarız.
        bytes memory walletInit = abi.encodeCall(SimpleAccountContract.initialize, owners);
        // Bu da kuracağımız proxy için constructor'ın calldata'sıdır.
        bytes memory proxyConstructor = abi.encode(
            address(walletImplementation),
            walletInit
        );
        // bu proxy'nin dağıtım bytecode'ini içerir - yani kodu ve constructor calldata'sını içerir.
        bytes memory bytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            proxyConstructor
        );
        // bytecodeHash'in hesaplandığı yer
        bytes32 bytecodeHash = keccak256(bytecode);
        // Salt ve bytecodeHash'i birleştirerek adres hesaplanır.
        return Create2.computeAddress(bytes32(salt), bytecodeHash);
    }

    function createAccount(
        address[] memory owners,
        uint256 salt
    ) external returns (SimpleAccountContract) {
        // İlk olarak, getAddress fonksiyonunu çağırarak adresi elde ediyoruz.
        address addr = getAddress(owners, salt);
        // Kontratın zaten var olup olmadığını kod boyutunu kontrol ederek doğruluyoruz.
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            // Eğer öyleyse, sadece o adresteki proxy kontratını döndürüyoruz.
            return SimpleAccountContract(payable(addr));
        }

        // Eğer öyle değilse, yeni bir proxy kontratı dağıtıyoruz
        bytes memory walletInit = abi.encodeCall(SimpleAccountContract.initialize, owners);
        // Salt kullanıyoruz; bu, proxy kontratı için benzersiz bir adres sağlamak için kullanılır.
        // Proxy kontratının constructor'ının argümanları olarak wallet implementasyonunun adresini ve walletInit'i gönderiyoruz.
        ERC1967Proxy proxy = new ERC1967Proxy{salt: bytes32(salt)}(
            address(walletImplementation),
            walletInit
        );

        // Hesabın adresini döndürüyoruz.
        return SimpleAccountContract(payable(address(proxy)));
    }

}
