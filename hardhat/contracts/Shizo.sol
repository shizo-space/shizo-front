// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import 'hardhat/console.sol';

contract Shizo is ERC721 {
  using Strings for uint256;
  using Strings for uint16;
  using Strings for uint8;
  using ECDSA for bytes32;
  using ECDSA for bytes;

  address public shenAddress;
  address public owner;

  uint256 MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

  // uint256 public constant PRICE = 1000000000000000; // 0.001 MATIC
  uint256 public constant ROYALITY = 5; // 5%

  uint8 public constant WALK_SPEED = 5;
  uint8 public constant BIKE_SPEED = 10;
  uint8 public constant TAXI_SPEED = 25;
  
  uint public constant MAX_DELTA_TIME = 24 * 3600; //max deltaTime for a transit

	uint8 public constant RARITY_COMMON = 0;
	uint8 public constant RARITY_UNCOMMON = 1; 
	uint8 public constant RARITY_RARE = 2;
	uint8 public constant RARITY_EPIC = 3;
	uint8 public constant RARITY_LEGENDARY = 4;

  uint8 public constant ROAD_BLOCKED = 0;
  uint8 public constant ROAD_UNBLOCKED = 1;
  uint8 public constant ROAD_ONEWAY_POS = 2;
  uint8 public constant ROAD_ONEWAY_NEG = 3;

  uint8 public constant COLOR_NULL = 0;
  uint8 public constant COLOR_RED = 1;

  mapping(uint8 => uint256) shenConsumption; 

  mapping(uint8 => uint256) shenRequiredForMint;
  mapping(uint8 => uint256) maticRequiredForMint;

  address linkTokenAddress = 0xa36085F69e2889c224210F603D836748e7dC0088;
  address oracleAddress = 0x74EcC8Bdeb76F2C6760eD2dc8A46ca5e581fA656;

  struct TokenOnMarketplace {
    bool listing;
    address publisher;
    uint256 price;
  }

  struct Position {
    int32 lat;
    int32 lon;
  }

  struct Entity {
    uint8 t;
    uint8 level;
    uint8 rarity;
    uint8 customColor;
    string customName;
    Position pos;
  }

  struct TeleportProps {
    uint24 cooldown;
    uint lastTeleportTime;
  }

  struct TransitStep {
    uint16 distance;
    int32 lat;
    int32 lon;
    uint256 tokenId;
  }

  struct TransitStorage {
    mapping(uint => TransitStep) steps;
    uint8 t;
    uint stepsCount;
    uint departureTime;
  }

  struct RoadBlockProps {
    bool isBlock;
    uint modifiedTime;
  }

  struct RoadBlockStorage {
    uint propsCount;
    uint lastPropIndex;
    mapping(uint => RoadBlockProps) props; // TODO ouside of the struct
  }

  mapping(uint64 => uint256) public mintedTokenIds;
  uint64 public mintedTokenIdsCount;
  mapping(uint256 => TeleportProps) public teleportsProps;
  mapping(uint256 => Entity) public entities;
  mapping(uint256 => RoadBlockStorage) public roadBlockStorage;
  mapping(address => Position) public staticPositions;
  mapping(address => TransitStorage) public transits;

  event RoadLimitationChanged(address indexed owner, uint256 indexed tokenId, uint8 blockStatus);
  event EntityChanged(address indexed changer, uint256 tokenId, Entity entity);
  event Purchase(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price);
  event LevelUp(address indexed owner, uint256 indexed land, uint256 level);

  mapping(uint256 => TokenOnMarketplace) public marketplace;

  error RoadBlocked(uint256 tokenId); 

  constructor(address _shenAddress) ERC721('Shizo', 'Shizo') {
    shenAddress = _shenAddress;
    owner = msg.sender;

    uint8 decimals = ERC20(shenAddress).decimals();
    shenConsumption[0] = 1 * (10 ** decimals) / 1000;
    shenConsumption[1] = 3 * (10 ** decimals) / 1000;
    shenConsumption[2] = 10 * (10 ** decimals) / 1000;

	shenRequiredForMint[RARITY_COMMON] = 10 * (10 ** decimals);
	shenRequiredForMint[RARITY_UNCOMMON] = 20 * (10 ** decimals);
	shenRequiredForMint[RARITY_RARE] = 50 * (10 ** decimals);
	shenRequiredForMint[RARITY_EPIC] = 100 * (10 ** decimals);
	shenRequiredForMint[RARITY_LEGENDARY] = 1000 * (10 ** decimals);

	maticRequiredForMint[RARITY_COMMON] = 1 * (10 ** decimals);
	maticRequiredForMint[RARITY_UNCOMMON] = 2 * (10 ** decimals);
	maticRequiredForMint[RARITY_RARE] = 5 * (10 ** decimals);
	maticRequiredForMint[RARITY_EPIC] = 10 * (10 ** decimals);
	maticRequiredForMint[RARITY_LEGENDARY] = 100 * (10 ** decimals);
  }

  function toString(int32 value) internal pure returns (string memory) {
    if (value == 0) {
        return "0";
    }
    int8 sign = 1;
    if (value < 0) {
      sign = -1;
      value = -value;
    }
    uint32 temp = uint32(value);
    uint32 digits;
    while (temp != 0) {
        digits++;
        temp /= 10;
    }
    if (sign == -1) {
      digits++;
    }
    bytes memory buffer = new bytes(digits);
    while (value != 0) {
        digits -= 1;
        buffer[digits] = bytes1(uint8(48 + uint32(value % 10)));
        value /= 10;
    }
    if (sign == -1) {
      buffer[0] = bytes1(uint8(45));
    }
    return string(buffer);
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');

    string memory baseURI = 'https://map.metagate.land/features';
    return
      bytes(baseURI).length > 0
        ? string(abi.encodePacked(abi.encodePacked(baseURI, tokenId.toString()), '/metadata/'))
        : '';
  }

  fallback() external payable {}

  receive() external payable {}

  function isLand(uint256 tokenId) public view returns (bool) {
    return entities[tokenId].t == 0;
  }

  function isRoad(uint256 tokenId) public view returns (bool) {
    return entities[tokenId].t == 1;
  }

  function mintByShen(
    uint256 tokenId,
    uint8 _type, // 0: Land, 1: Road
    uint8 rarity,
    int32 lat,
    int32 lon,
    bytes memory signature
  ) public payable returns (uint256) {
    require(!_exists(tokenId), 'token exists');
	  ERC20(shenAddress).transferFrom(msg.sender, address(this), shenRequiredForMint[rarity]);

    // TODO delete abi.encode .. use padding of strings
    // bytes memory hashed = abi.encode(
    //   'shizo:mint:',
    //   tokenId,
    //   ',',
    //   _type,
    //   ',',
    //   rarity,
    //   ',',
    //   lat,
    //   ',',
    //   lon
    // );

    // address signer = hashed.toEthSignedMessageHash().recover(signature);
    // require(owner == signer, 'Invalid signature');

    _safeMint(msg.sender, tokenId);
    entities[tokenId] = Entity(_type, 1, rarity, COLOR_NULL, "", Position(lat, lon));
    // emit EntityChanged(msg.sender, tokenId, entities[tokenId]);
    teleportsProps[tokenId] = TeleportProps(300, 0);

    TokenOnMarketplace memory tmp;
    tmp.listing = false;
    tmp.price = MAX_INT;
    tmp.publisher = _msgSender();

    marketplace[tokenId] = tmp;

    return tokenId;
  }

  // TODO add padding to vars
  function mint(
    uint256 tokenId,
    uint8 _type, // 0: Land, 1: Road
    uint8 rarity,
    int32 lat,
    int32 lon,
    bytes memory signature
  ) public payable returns (uint256) {
    require(msg.value == maticRequiredForMint[rarity], 'Price is not correct');
    require(!_exists(tokenId), 'token exists');

    // TODO delete abi.encode .. use padding of strings
    // bytes memory hashed = abi.encode(
    //   'shizo:mint:',
    //   tokenId,
    //   ',',
    //   _type,
    //   ',',
    //   rarity,
    //   ',',
    //   lat,
    //   ',',
    //   lon
    // );

    // address signer = hashed.toEthSignedMessageHash().recover(signature);
    // require(owner == signer, 'Invalid signature');

    _safeMint(msg.sender, tokenId);
    entities[tokenId] = Entity(_type, 1, rarity, COLOR_NULL, "", Position(lat, lon));
    // emit EntityChanged(msg.sender, tokenId, entities[tokenId]);
    teleportsProps[tokenId] = TeleportProps(300, 0);

    mintedTokenIds[mintedTokenIdsCount] = tokenId;
    mintedTokenIdsCount++;

    TokenOnMarketplace memory tmp;
    tmp.listing = false;
    tmp.price = MAX_INT;
    tmp.publisher = _msgSender();

    marketplace[tokenId] = tmp;

    return tokenId;
  }

  function listOnMarketplace(uint256 _tokenId, uint256 _price) public {
    require(_exists(_tokenId), 'listOnMarketplace: token not found');
    require(
      ownerOf(_tokenId) == msg.sender,
      'listOnMarketplace: only owner can list the token on marketplace'
    );
    marketplace[_tokenId].listing = true;
    marketplace[_tokenId].price = _price;
  }

  function removeFromMarketplace(uint256 _tokenId) public {
    require(_exists(_tokenId), 'removeFromMarketplace: token not found');
    require(
      ownerOf(_tokenId) == msg.sender,
      'removeFromMarketplace: only owner can remove the token from marketplace'
    );
    marketplace[_tokenId].listing = false;
    marketplace[_tokenId].price = MAX_INT;
  }

  function purchase(uint256 _tokenId) public payable {
    require(_exists(_tokenId), 'purchase: token not found');
    require(marketplace[_tokenId].listing, 'purchase: the token is not listed');
    require(msg.value == marketplace[_tokenId].price, 'purchase: the price is not correct');

    uint256 fee = (msg.value * ROYALITY) / 100;

    payable(address(this)).transfer(fee);
    payable(ownerOf(_tokenId)).transfer(msg.value - fee);

    emit Purchase(ownerOf(_tokenId), msg.sender, _tokenId, msg.value);

    _transfer(ownerOf(_tokenId), msg.sender, _tokenId);

    marketplace[_tokenId].listing = false;
    marketplace[_tokenId].price = MAX_INT;
  }

  function shizoRequiredForLvlup(uint256 tokenId) public view returns (uint256) {
    return entities[tokenId].level * 10 * 10**ERC20(shenAddress).decimals(); // 10 CINERGY * current level
  }

  function lvlup(uint256 tokenId) external {
    require(ownerOf(tokenId) == msg.sender, 'Only owner can do this');

    // LOGIC HERE

    uint256 shenRequired = shizoRequiredForLvlup(tokenId);

    require(IERC20(shenAddress).balanceOf(msg.sender) >= shenRequired, 'Not enough SHEN');

    ERC20Burnable(shenAddress).burnFrom(msg.sender, shenRequired);
    entities[tokenId].level += 1;
    // emit EntityChanged(msg.sender, tokenId, entities[tokenId]);

    emit LevelUp(ownerOf(tokenId), tokenId, entities[tokenId].level);
  }

  function teleport(uint256 tokenId) external {
    require(ownerOf(tokenId) == msg.sender, 'Only owner can do this');
    require(entities[tokenId].t == 0, 'You can only teleport to lands');
    require(
      teleportsProps[tokenId].cooldown + teleportsProps[tokenId].lastTeleportTime < block.timestamp,
      'You must wait before doing another teleport'
    );

    staticPositions[msg.sender] = entities[tokenId].pos;
    teleportsProps[tokenId].lastTeleportTime = block.timestamp;
  }

  // TODO store props in a local var maybe save gas fee?
  function changeRoadLimitations(uint256 tokenId, bool isBlock) external {
    require(ownerOf(tokenId) == msg.sender, 'Only owner can do this');
    require(entities[tokenId].t == 1, 'You can only block roads');
    uint propsCount = roadBlockStorage[tokenId].propsCount;
    uint lastPropIndex = roadBlockStorage[tokenId].lastPropIndex;
    if (propsCount > 0 && roadBlockStorage[tokenId].props[lastPropIndex].isBlock == isBlock) {
      revert('Already applied');
    }

    uint oldestPropIndex = 0;
    if (propsCount > 1) {
      for (uint i = 1; i < propsCount; i++) {
        if (roadBlockStorage[tokenId].props[i].modifiedTime < roadBlockStorage[tokenId].props[oldestPropIndex].modifiedTime) {
          oldestPropIndex = i;
        }
      }

    }
    uint currentTime = block.timestamp;
    if (currentTime - roadBlockStorage[tokenId].props[oldestPropIndex].modifiedTime > MAX_DELTA_TIME) {
      roadBlockStorage[tokenId].props[oldestPropIndex].modifiedTime = currentTime;
      roadBlockStorage[tokenId].props[oldestPropIndex].isBlock = isBlock;
      roadBlockStorage[tokenId].lastPropIndex = oldestPropIndex;
    } else {
      propsCount++;
      roadBlockStorage[tokenId].props[propsCount - 1].modifiedTime = currentTime;
      roadBlockStorage[tokenId].props[propsCount - 1].isBlock = isBlock;
    }

    emit RoadLimitationChanged(ownerOf(tokenId), tokenId, isBlock ? ROAD_BLOCKED : ROAD_UNBLOCKED);
  }

  function readLastRoadblockStatuses(uint256[] memory tokenIds) public view returns (bool[] memory) {
    bool[] memory result = new bool[](tokenIds.length);
    for (uint i = 0; i < tokenIds.length; i++) {
      uint256 propsCount = roadBlockStorage[tokenIds[i]].propsCount;
      if (propsCount > 0) {
        result[i] = roadBlockStorage[tokenIds[i]].props[roadBlockStorage[tokenIds[i]].lastPropIndex].isBlock;
      } else {
        result[i] = false;
      }
    }
    return result;
  }

  // TODO should consume cinergy to do this action
  // TODO steps should be a custom polyline for checking signatures
  // TODO use encode instead of encodePacked
  // TODO error messages
  function startTransit(uint8 _type, TransitStep[] memory steps, bytes memory signature) external {
    require(staticPositions[msg.sender].lat == steps[0].lat, "Transit: Invalid starting position");
    require(staticPositions[msg.sender].lon == steps[0].lon, "Transit: Invalid starting position");
    require(_type == 0 || _type == 1, 'Transit: Type is not valid');

    // bytes memory hashed;
    // hashed = abi.encodePacked('shizo:transit:', toString(staticPositions[msg.sender].lat), toString(staticPositions[msg.sender].lon));
    for (uint i = 0; i < steps.length; i++) {
      uint256 tokenId = steps[i].tokenId;
      if (i > 0 && roadBlockStorage[tokenId].propsCount > 0 &&
        roadBlockStorage[tokenId].props[roadBlockStorage[tokenId].propsCount - 1].isBlock && 
        ownerOf(tokenId) != msg.sender) {
        // TODO use custom errors
        revert RoadBlocked(steps[i].tokenId);
      }

      if (i == 0) {
        // hashed = abi.encodePacked(string(hashed), tokenId.toString(), ',', toString(steps[i].lat), ',', toString(steps[i].lon), ',', steps[i].distance.toString());
      } else {
        // hashed = abi.encodePacked(string(hashed), ',', tokenId.toString(), ',', toString(steps[i].lat), ',', toString(steps[i].lon), ',', steps[i].distance.toString());
      }
    }
    // address signer = hashed.toEthSignedMessageHash().recover(signature);
    // require(owner == signer, 'Invalid signature');

    transits[msg.sender].stepsCount = steps.length;
    for (uint i = 0; i < steps.length; i++) {
      TransitStorage storage myTransit = transits[msg.sender];
      myTransit.steps[i] = TransitStep(steps[i].distance, steps[i].lat, steps[i].lon, steps[i].tokenId);
    }
    
    transits[msg.sender].departureTime = block.timestamp;
    transits[msg.sender].t = _type;
  }

  function getDistanceTraversed(address addrs) public view returns (uint32, uint) {
    console.log("getDistanceTraversed");
    require(transits[addrs].departureTime != 0, 'No active transit');
    uint32 deltaTime = uint32(block.timestamp - transits[addrs].departureTime);
    console.log(block.timestamp);
    console.log(transits[addrs].departureTime);
    console.log(deltaTime);
    require(deltaTime < MAX_DELTA_TIME, 'Invalid transit');
    uint8 speed;
    if (transits[addrs].t == 0) {
      speed = WALK_SPEED;
    } else if (transits[addrs].t == 1) {
      speed = BIKE_SPEED;
    } else {
      speed = TAXI_SPEED;
    }

    uint32 distance = deltaTime * speed;
    uint32 sumDistance = 0;
    uint time = transits[addrs].departureTime;
    uint lastStepIndex = 0;
    for (uint i = 0; i < transits[addrs].stepsCount; i++) {
      uint256 tokenId = transits[addrs].steps[i].tokenId;
      // for (uint j = roadBlockStorage[tokenId].propsCount - 1; j >= roadBlockStorage[tokenId].startingIndex; j--) {
      //   if (roadBlockStorage[tokenId].props[j].modifiedTime < time && 
      //     (j == 0 || roadBlockStorage[tokenId].props[j - 1].modifiedTime >= time) && roadBlockStorage[tokenId].props[j].isBlock) {
      //     return sumDistance;
      //   }
      // }
      if (sumDistance + transits[addrs].steps[i].distance > distance) {
        lastStepIndex = i;
        break;
      }

      sumDistance += transits[addrs].steps[i].distance;
      time += transits[addrs].steps[i].distance / speed;
    }

    return (distance, lastStepIndex);
  }

  function finishTransit() external {
    require(transits[msg.sender].departureTime != 0, 'No active transit');
    (uint32 distance, ) = getDistanceTraversed(msg.sender);
    uint32 totalDistance = 0;
    uint stepsCount = transits[msg.sender].stepsCount;
    for(uint i = 0; i < stepsCount; i++) {
      totalDistance += transits[msg.sender].steps[i].distance;
    }

    require(distance >= totalDistance, 'Transit not finished yet');

    uint256 shenRequired = shenConsumption[transits[msg.sender].t] * distance;
    console.log(shenRequired);
    console.log(IERC20(shenAddress).balanceOf(msg.sender));

    require(IERC20(shenAddress).balanceOf(msg.sender) >= shenRequired, 'Not enough SHEN');
    IERC20(shenAddress).transferFrom(msg.sender, owner, shenRequired);

    staticPositions[msg.sender].lat = transits[msg.sender].steps[stepsCount - 1].lat;
    staticPositions[msg.sender].lon = transits[msg.sender].steps[stepsCount - 1].lon;
    transits[msg.sender].departureTime = 0;
    transits[msg.sender].stepsCount = 0;
    console.log("done");
  }


  function getTransitSteps(address addrs) public view returns(TransitStep[] memory) {
    TransitStep[] memory steps = new TransitStep[](transits[addrs].stepsCount);
    for (uint i = 0; i < transits[addrs].stepsCount; i++) {
      steps[i] = (transits[addrs].steps[i]);
    }

    return steps;
  }

  function cancelTransit() external {
    require(transits[msg.sender].departureTime != 0, 'No active transit');

    transits[msg.sender].departureTime = 0;
    transits[msg.sender].stepsCount = 0;
  }

  function abortTransit() external {
    require(transits[msg.sender].departureTime != 0, 'No active transit');
    transits[msg.sender].departureTime = 0;
    transits[msg.sender].stepsCount = 0;
  }
}
