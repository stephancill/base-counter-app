// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract CounterNFT is ERC721 {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;
    address private _lastCaller;

    event CounterIncremented(
        uint256 indexed newCount,
        address indexed caller,
        uint256 timestamp
    );

    constructor() ERC721("CounterNFT", "CNT") {}

    function count() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function lastCaller() public view returns (address) {
        return _lastCaller;
    }

    function incrementAndMint() external {
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _lastCaller = msg.sender;

        _safeMint(msg.sender, newTokenId);
        emit CounterIncremented(newTokenId, _lastCaller, block.timestamp);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        string memory json = string(
            abi.encodePacked(
                '{"name":"Counter NFT #',
                tokenId.toString(),
                '","description":"An NFT minted by incrementing the counter","attributes":[{"trait_type":"Counter Value","value":"',
                tokenId.toString(),
                '"},{"trait_type":"Minted By","value":"',
                Strings.toHexString(uint160(ownerOf(tokenId)), 20),
                '"}]}'
            )
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(bytes(json))
            )
        );
    }
}

