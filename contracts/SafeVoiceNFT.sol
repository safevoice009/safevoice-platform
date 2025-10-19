// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/*
  SafeVoiceNFT — Minimal OpenZeppelin ERC-721 with safeMint
  - Owner can set baseURI
  - Exposes safeMint(address to, string memory tokenURI) for easy minting from the frontend (requires contract ownership or open access depending on your policy)
  - Designed for testnet & production; follow OpenZeppelin best practices for permissioning & audits before mainnet use
*/

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SafeVoiceNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        _nextTokenId = 1;
    }

    // Mint and set tokenURI (owner-only by default)
    function safeMint(address to, string memory tokenURI_) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        return tokenId;
    }

    // Optional public mint function (onlyOwner recommended for controlled minting)
    // Remove onlyOwner if you want open minting; replace with a minter role for safer ops.
    function mintTo(address to, string memory tokenURI_) public onlyOwner returns (uint256) {
        return safeMint(to, tokenURI_);
    }

    // Internal setter
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }

    // Override tokenURI
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token doesn't exist");
        return _tokenURIs[tokenId];
    }

    // Admin: set next token id (emergency)
    function setNextTokenId(uint256 nextId) external onlyOwner {
        _nextTokenId = nextId;
    }
}