// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import 'hardhat/console.sol';

import './math.sol';


contract Chest is ERC721, VRFConsumerBaseV2 {
  using Strings for uint256;
  using Strings for uint8;
  using ECDSA for bytes32;
  using ECDSA for bytes;

  VRFCoordinatorV2Interface COORDINATOR;

  address public owner;

  // Our subscription ID.
  uint64 s_subscriptionId;

  // Rinkeby coordinator. For other networks,
  // see https://docs.chain.link/docs/vrf-contracts/#configurations
  // address vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;

  // The gas lane to use, which specifies the maximum gas price to bump to.
  // For a list of available gas lanes on each network,
  // see https://docs.chain.link/docs/vrf-contracts/#configurations
  // bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f; mumbai
  bytes32 s_keyHash;

  // Depends on the number of requested values that you want sent to the
  // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
  // so 100,000 is a safe default for this example contract. Test and adjust
  // this limit based on the network that you select, the size of the request,
  // and the processing of the callback request in the fulfillRandomWords()
  // function.
  uint32 callbackGasLimit = 100000;

  // The default is 3, but you can set this higher.
  uint16 requestConfirmations = 3;

  // For this example, retrieve 2 random values in one request.
  // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
  uint32 numWords = 4; // We need 4 radnom number for lat, long, type and tier

  uint256 public s_requestId;

  uint8 public constant LAT_LON_PRECISION = 6;

  bool public pending_randomness = false;

  int32 private _minLat;
  int32 private _maxLat;
  int32 private _minLon;
  int32 private _maxLon;
  uint8 private _minType;
  uint8 private _maxType;
  uint8 private _minTier;
  uint8 private _maxTier;

  struct TreasureChest {
    int32 lat;
    int32 lon;
    uint8 t;
    uint8 tier;
  }

  mapping(uint256 => TreasureChest) public treasureChests;

  event Spawned(uint256 indexed tokenId, int32 lat, int32 lon, uint8 t, uint8 tier);
  event Claimed(
    address indexed owner,
    uint256 indexed tokenId,
    int32 lat,
    int32 lon,
    uint8 t,
    uint8 tier
  );

  using Counters for Counters.Counter;
  Counters.Counter public nextTokenId;

  constructor(
      address vrfCoordinator,
      bytes32 keyHash,
      uint64 subscriptionId
    ) VRFConsumerBaseV2(vrfCoordinator) ERC721('Shizo Treasure Chest', 'ShizoTreasureChest') {
    COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
    s_subscriptionId = subscriptionId; // https://vrf.chain.link/new .. 327
    s_keyHash = keyHash;
    owner = msg.sender;
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');

    string memory baseURI = 'https://map.metagate.land/features';
    return
      bytes(baseURI).length > 0
        ? string(abi.encodePacked(abi.encodePacked(baseURI, tokenId.toString()), '/metadata/'))
        : '';
  }

  // Assumes the subscription is funded sufficiently.
  function requestRandomWords(
    int32 minLat,
    int32 maxLat,
    int32 minLon,
    int32 maxLon,
    uint8 minType,
    uint8 maxType,
    uint8 minTier,
    uint8 maxTier
  ) external onlyOwner {
    // Will revert if subscription is not set and funded.
    s_requestId = COORDINATOR.requestRandomWords(
      s_keyHash,
      s_subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );

    _minLat = minLat;
    _maxLat = maxLat;
    _minLon = minLon;
    _maxLon = maxLon;
    _minType = minType;
    _maxType = maxType;
    _minTier = minTier;
    _maxTier = maxTier;
  }

  function fulfillRandomWords(
    uint256, /* requestId */
    uint256[] memory randomWords
  ) internal override {
    int32 r0 = int32(int(randomWords[0] & ((1 << 31) - 1)));
    int32 r1 = int32(int(randomWords[1] & ((1 << 31) - 1)));

    TreasureChest memory treasureChest = TreasureChest(
      (r0 % ((_maxLat - _minLat) + 1)) + _minLat,
      (r1 % ((_maxLon - _minLon) + 1)) + _minLon,
      (uint8(randomWords[2] & ((1 << 7) - 1)) % (_maxType - _minType + 1)) + _minType,
      (uint8(randomWords[3] & ((1 << 7) - 1)) % (_maxTier - _minTier + 1)) + _minTier
    );
    
    treasureChests[nextTokenId.current()] = treasureChest;
    // console.log(2);
    // math.cos(30);
    console.log(math.distance2(35740489, 51375246, 35726408, 51379295)); // this should be around 874720955971747546 (1.6 km)
    // console.log(uint64(math.sin(0)));
    // console.log(uint64(math.sin(30)));
    // console.log(uint64(math.sin(45)));
    // console.log(uint64(math.sin(60)));
    // console.log(uint64(math.sin(90)));

    // console.log(uint(res));
    // console.log(math.getNegativeUint());
    // console.log(math.getNegativeUintPower());
    
    emit Spawned(
      nextTokenId.current(),
      treasureChests[nextTokenId.current()].lat,
      treasureChests[nextTokenId.current()].lon,
      treasureChests[nextTokenId.current()].t,
      treasureChests[nextTokenId.current()].tier
    );
    nextTokenId.increment();
  }

  function fulfillRandomWordsTest(
    uint256 requestId, /* requestId */
    uint256[] memory randomWords
  ) external onlyOwner {
    fulfillRandomWords(requestId, randomWords);
  }

  function mint(uint256 tokenId) public returns (uint256) {
    // static position check shavad

    
    require(!_exists(tokenId), 'token exists');
    require(tokenId < nextTokenId.current(), 'Token not spawned yet');

    _safeMint(msg.sender, tokenId);

    emit Claimed(
      msg.sender,
      tokenId,
      treasureChests[tokenId].lat,
      treasureChests[tokenId].lon,
      treasureChests[tokenId].t,
      treasureChests[tokenId].tier
    );
    return tokenId;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }
}
