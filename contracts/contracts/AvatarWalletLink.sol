// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./AvatarBase.sol";

contract AvatarWalletLink {
    AvatarBase public avatarBase;
    mapping(uint256 => address) public ownerOf;
    
    event WalletLinked(uint256 indexed avatarId, address indexed wallet);
    
    constructor(address _avatarBase) {
        avatarBase = AvatarBase(_avatarBase);
    }
    
    function link(uint256 avatarId, address wallet) external {
        ownerOf[avatarId] = wallet;
        emit WalletLinked(avatarId, wallet);
    }
}
