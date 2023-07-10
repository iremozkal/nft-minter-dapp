// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMinter is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    address private _treasuryWallet;
    address private _liquidityWallet;

    uint256 private constant ROYALTY_FEE = 10;
    uint256 private constant RATIO_FOR_TREASURY = 6;
    uint256 private constant RATIO_FOR_LIQUIDITY = 4;

    constructor(
        address treasuryWallet,
        address liquidityWallet
    ) ERC721("NFTMinter", "NFTMNTR") {
        require(
            treasuryWallet != address(0),
            "Invalid treasury wallet address"
        );
        require(
            liquidityWallet != address(0),
            "Invalid liquidity wallet address"
        );

        _treasuryWallet = treasuryWallet;
        _liquidityWallet = liquidityWallet;
    }

    function safeMint(
        string memory uri,
        uint256 price
    ) public payable returns (uint256) {
        require(price > 0, "Invalid price");
        require(msg.value >= price, "Insufficient payment");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        uint256 royaltyAmount = (price * ROYALTY_FEE) / 100;
        uint256 treasuryAmount = (royaltyAmount * RATIO_FOR_TREASURY) / 10;
        uint256 liquidityAmount = (royaltyAmount * RATIO_FOR_LIQUIDITY) / 10;

        (bool success, ) = _treasuryWallet.call{value: treasuryAmount}("");
        require(success, "Failed to transfer royalty to treasury wallet");

        (success, ) = _liquidityWallet.call{value: liquidityAmount}("");
        require(success, "Failed to transfer royalty to liquidity wallet");

        return tokenId;
    }

    // The following functions are overrides required by Solidity.

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
