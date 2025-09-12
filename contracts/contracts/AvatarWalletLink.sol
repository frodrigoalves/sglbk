// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
contract AvatarWalletLink {
    mapping(uint256 => address) public ownerOf;
    event WalletLinked(uint256 indexed avatarId, address indexed wallet);
    function link(uint256 avatarId, address wallet) external {
        ownerOf[avatarId] = wallet;
        emit WalletLinked(avatarId, wallet);
    }
}
