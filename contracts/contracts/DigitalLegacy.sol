// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./AvatarBase.sol";

contract DigitalLegacy {
    AvatarBase public avatarBase;
    
    struct Legacy { 
        uint256 avatarId; 
        string cid; 
        string rules; 
        bool unlocked; 
    }
    
    mapping(bytes32 => Legacy) public legacies;
    
    event LegacyCreated(bytes32 indexed id, uint256 avatarId, string cid, string rules);
    event LegacyUnlocked(bytes32 indexed id, uint256 avatarId);
    
    constructor(address _avatarBase) {
        avatarBase = AvatarBase(_avatarBase);
    }
    
    function createLegacy(uint256 avatarId, string memory cid, string memory rules) external {
        bytes32 id = keccak256(abi.encodePacked(avatarId, cid));
        legacies[id] = Legacy(avatarId, cid, rules, false);
        emit LegacyCreated(id, avatarId, cid, rules);
    }
    
    function unlockLegacy(bytes32 id) external {
        Legacy storage L = legacies[id];
        require(!L.unlocked, "already");
        L.unlocked = true;
        emit LegacyUnlocked(id, L.avatarId);
    }
}
