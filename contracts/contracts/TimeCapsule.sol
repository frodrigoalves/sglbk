// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
contract TimeCapsule {
    struct Capsule { uint256 avatarId; uint256 unlockDate; string cid; bool unlocked; }
    mapping(bytes32 => Capsule) public capsules;
    event CapsuleCreated(bytes32 indexed id, uint256 avatarId, uint256 unlockDate, string cid);
    event CapsuleUnlocked(bytes32 indexed id, uint256 avatarId, string cid);
    function createCapsule(uint256 avatarId, uint256 unlockDate, string memory cid) external {
        bytes32 id = keccak256(abi.encodePacked(avatarId, cid));
        capsules[id] = Capsule(avatarId, unlockDate, cid, false);
        emit CapsuleCreated(id, avatarId, unlockDate, cid);
    }
    function unlockIfReady(uint256 avatarId, string memory cid) external {
        bytes32 id = keccak256(abi.encodePacked(avatarId, cid));
        Capsule storage c = capsules[id];
        require(block.timestamp >= c.unlockDate, "locked");
        require(!c.unlocked, "already");
        c.unlocked = true;
        emit CapsuleUnlocked(id, avatarId, cid);
    }
}
