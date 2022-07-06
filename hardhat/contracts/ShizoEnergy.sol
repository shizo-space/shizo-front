// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import 'hardhat/console.sol';

contract ShizoEnergy is ERC20Burnable {
  using Strings for uint256;
  using Strings for uint8;
  using ECDSA for bytes32;
  using ECDSA for bytes;

  mapping(bytes32 => bool) private _usedSignatures;
  address public owner;

  constructor() ERC20('Shizo Energy', 'SHEN') {
    owner = msg.sender;
    _mint(msg.sender, 10000000 * 10**super.decimals());
  }

  function claim(uint256 amount, bytes memory signature) external {
    bytes32 hashed = abi.encodePacked('cinergy:claim:', amount.toString()).toEthSignedMessageHash();
    require(_usedSignatures[hashed] == false, 'Signature already used');

    address signer = hashed.recover(signature);
    require(owner == signer, 'Invalid signature');

    _mint(msg.sender, amount);
    _usedSignatures[hashed] = true;
  }
}
