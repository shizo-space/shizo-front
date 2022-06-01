// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';

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
  address vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;

  // The gas lane to use, which specifies the maximum gas price to bump to.
  // For a list of available gas lanes on each network,
  // see https://docs.chain.link/docs/vrf-contracts/#configurations
  bytes32 keyHash = 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

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

  uint8 public constant LAT_LONG_PRECISION = 6;

  bool public pending_randomness = false;

  uint256 private _minLat;
  uint256 private _maxLat;
  uint256 private _minLong;
  uint256 private _maxLong;
  uint256 private _minType;
  uint256 private _maxType;
  uint256 private _minTier;
  uint256 private _maxTier;

  mapping(uint256 => uint256) public lats;
  mapping(uint256 => uint256) public longs;
  mapping(uint256 => uint256) public types;
  mapping(uint256 => uint256) public tiers;

  event Spawned(uint256 indexed tokenId, uint256 lat, uint256 long, uint256 type_, uint256 tier);
  event Claimed(
    address indexed owner,
    uint256 indexed tokenId,
    uint256 lat,
    uint256 long,
    uint256 type_,
    uint256 tier
  );

  using Counters for Counters.Counter;
  Counters.Counter public nextTokenId;

  constructor() VRFConsumerBaseV2(vrfCoordinator) ERC721('Shizo Treasure Chest', 'ShizoTreasureChest') {
    COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
    s_subscriptionId = 327; // https://vrf.chain.link/new
    owner = msg.sender;
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');

    string memory baseURI = 'https://map.metagate.land/features/';
    return
      bytes(baseURI).length > 0
        ? string(abi.encodePacked(abi.encodePacked(baseURI, tokenId.toString()), '/metadata/'))
        : '';
  }

  // Assumes the subscription is funded sufficiently.
  function requestRandomWords(
    uint256 minLat,
    uint256 maxLat,
    uint256 minLong,
    uint256 maxLong,
    uint256 minType,
    uint256 maxType,
    uint256 minTier,
    uint256 maxTier
  ) external onlyOwner {
    // Will revert if subscription is not set and funded.
    s_requestId = COORDINATOR.requestRandomWords(
      keyHash,
      s_subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );

    _minLat = minLat;
    _maxLat = maxLat;
    _minLong = minLong;
    _maxLong = maxLong;
    _minType = minType;
    _maxType = maxType;
    _minTier = minTier;
    _maxTier = maxTier;
  }

  function fulfillRandomWords(
    uint256, /* requestId */
    uint256[] memory randomWords
  ) internal override {
    lats[nextTokenId.current()] =
      (randomWords[0] % ((_maxLat - _minLat) * 10**LAT_LONG_PRECISION + 1)) +
      _minLat *
      10**LAT_LONG_PRECISION;

    longs[nextTokenId.current()] =
      (randomWords[1] % ((_maxLong - _minLong) * 10**LAT_LONG_PRECISION + 1)) +
      _minLong *
      10**LAT_LONG_PRECISION;

    types[nextTokenId.current()] = (randomWords[2] % (_maxType - _minType + 1)) + _minType;

    tiers[nextTokenId.current()] = (randomWords[3] % (_maxTier - _minTier + 1)) + _minTier;
  }

  function spawn() external onlyOwner {
    emit Spawned(
      nextTokenId.current(),
      lats[nextTokenId.current()],
      longs[nextTokenId.current()],
      types[nextTokenId.current()],
      tiers[nextTokenId.current()]
    );
    nextTokenId.increment();
  }

  function mint(uint256 tokenId, bytes memory signature) public returns (uint256) {
    require(!_exists(tokenId), 'token exists');
    require(tokenId < nextTokenId.current(), 'Token not spawned yet');

    bytes memory hashed = abi.encodePacked('chest:mint:', tokenId.toString());
    address signer = hashed.toEthSignedMessageHash().recover(signature);
    require(owner == signer, 'Invalid signature');

    _safeMint(msg.sender, tokenId);

    emit Claimed(
      msg.sender,
      nextTokenId.current(),
      lats[nextTokenId.current()],
      longs[nextTokenId.current()],
      types[nextTokenId.current()],
      tiers[nextTokenId.current()]
    );
    return tokenId;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }
}
