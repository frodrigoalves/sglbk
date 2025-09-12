// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract AvatarBase is ERC721 {
    uint256 public nextId;
    mapping(uint256 => string) public attributes;
    event AvatarMinted(uint256 indexed tokenId, address indexed owner, string attrs);
    constructor() ERC721("SingulAI Avatar", "SAVT") {}
    function mint(address to, string memory attrs) external returns (uint256 tokenId) {
        tokenId = ++nextId;
        _safeMint(to, tokenId);
        attributes[tokenId] = attrs;
        emit AvatarMinted(tokenId, to, attrs);
    }
}
