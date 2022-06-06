// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import 'hardhat/console.sol';

contract Shizo is ERC721 {
  using Strings for uint256;
  using Strings for uint8;
  using ECDSA for bytes32;
  using ECDSA for bytes;

  address public cinergy;
  address public owner;

  uint256 MAX_INT = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

  uint256 public constant PRICE = 1000000000000000; // 0.001 MATIC
  uint256 public constant ROYALITY = 5; // 5%
  uint8 public constant WALK_SPEED = 5;
  uint8 public constant RUN_SPEED = 10;
  uint8 public constant TAXI_SPEED = 16;

  uint public constant MAX_DELTA_TIME = 24 * 3600; //max deltaTime for a transit

  address linkTokenAddress = 0xa36085F69e2889c224210F603D836748e7dC0088;
  address oracleAddress = 0x74EcC8Bdeb76F2C6760eD2dc8A46ca5e581fA656;

  struct TokenOnMarketplace {
    bool listing;
    uint256 price;
    address publisher;
  }

  struct Position {
    int32 lat;
    int32 lon;
  }

  struct Entity {
    uint8 t;
    uint8 level;
    uint8 rarity;
    Position pos;
  }

  struct TeleportProps {
    uint24 cooldown;
    uint lastTeleportTime;
  }

  struct TransitStep {
    uint256 tokenId;
    int32 lat;
    int32 lon;
    uint16 distance;
  }

  struct Transit {
    TransitStep[] steps;
    uint departureTime;
    uint8 t;
  }

  struct RoadBlockProps {
    uint modifiedTime;
    bool isBlock;
  }

  struct RoadBlockStorage {
    uint startingIndex;
    RoadBlockProps[] props;
  }

  mapping(uint256 => TeleportProps) public teleportsProps;
  mapping(uint256 => Entity) public entities;
  mapping(uint256 => RoadBlockStorage) public roadBlockStorage;
  mapping(address => Position) private staticPositions;
  mapping(address => Transit) public transits;
  // mapping(address => TransitStep[]) public transitSteps;

  event Purchase(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price);
  event LevelUp(address indexed owner, uint256 indexed land, uint256 level);

  mapping(uint256 => TokenOnMarketplace) public marketplace;

  error RoadBlocked(uint256 tokenId); 

  constructor(address _cinergy) ERC721('Shizo', 'Shizo') {
    cinergy = _cinergy;
    owner = msg.sender;
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

    string memory baseURI = 'https://map.metagate.land/features/';
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

  // TODO add padding to vars
  function mint(
    uint256 tokenId,
    uint8 _type,
    uint8 rarity,
    int32 lat,
    int32 lon,
    bytes memory signature
  ) public payable returns (uint256) {
    require(msg.value == PRICE, 'Price is not correct');
    require(!_exists(tokenId), 'token exists');

    bytes memory hashed = abi.encode(
      'shizo:mint:',
      tokenId,
      ',',
      _type,
      ',',
      rarity,
      ',',
      lat,
      ',',
      lon
    );

    address signer = hashed.toEthSignedMessageHash().recover(signature);
    require(owner == signer, 'Invalid signature');

    _safeMint(msg.sender, tokenId);
    entities[tokenId] = Entity(_type, 1, rarity, Position(lat, lon));
    if (_type == 0) { // isLand
      teleportsProps[tokenId] = TeleportProps(300, 0);
    }

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
    return entities[tokenId].level * 10 * 10**ERC20(cinergy).decimals(); // 10 CINERGY * current level
  }

  function lvlup(uint256 tokenId) external {
    require(ownerOf(tokenId) == msg.sender, 'Only owner can do this');

    // LOGIC HERE

    uint256 requiredCinergy = shizoRequiredForLvlup(tokenId);

    require(IERC20(cinergy).balanceOf(msg.sender) >= requiredCinergy, 'Not enough CINERGY');

    ERC20Burnable(cinergy).burnFrom(msg.sender, requiredCinergy);
    entities[tokenId].level += 1;

    emit LevelUp(ownerOf(tokenId), tokenId, entities[tokenId].level);
  }

  function teleport(uint256 tokenId) external {
    require(ownerOf(tokenId) == msg.sender, 'Only owner can do this');
    require(entities[tokenId].t == 0, 'You can only teleport to lands');
    require(
      teleportsProps[tokenId].cooldown + teleportsProps[tokenId].lastTeleportTime < block.timestamp,
      string(abi.encodePacked('You must wait ',
        block.timestamp - (teleportsProps[tokenId].cooldown + teleportsProps[tokenId].lastTeleportTime),
        ' seconds before you can teleport again to this property')
      )
    );

    staticPositions[ownerOf(tokenId)] = entities[tokenId].pos;
    teleportsProps[tokenId].lastTeleportTime = block.timestamp;
  }

  // TODO optimization for validProps (it's currently storage, maybe we should delete array elems on the fly)
  function changeRoadLimitations(uint256 tokenId, bool isBlock) external {
    require(ownerOf(tokenId) == msg.sender, 'Only owner can do this');
    require(entities[tokenId].t == 1, 'You can only block roads');
    RoadBlockProps[] memory rBlockProps = roadBlockStorage[tokenId].props;
    if (rBlockProps.length > 0 && rBlockProps[rBlockProps.length - 1].isBlock == isBlock) {
      //use custom errors
      revert('Already applied');
    }
    uint currentTime = block.timestamp;
    for (uint i = rBlockProps.length - 1; i >= 0; i--) {
      if (currentTime - rBlockProps[i].modifiedTime > MAX_DELTA_TIME) {
        roadBlockStorage[tokenId].startingIndex = i;
      }
    }
    roadBlockStorage[tokenId].props.push(RoadBlockProps(currentTime, isBlock));
  }

  // TODO should consume cinergy to do this action
  // TODO steps should be a custom polyline for checking signatures
  // TODO use encode instead of encodePacked
  // TODO error messages
  function startTransit(uint8 _type, TransitStep[] memory steps, bytes memory signature) external {
    require(staticPositions[msg.sender].lat == steps[0].lat, "Transit: Invalid starting position");
    require(staticPositions[msg.sender].lon == steps[0].lon, "Transit: Invalid starting position");
    require(_type == 0 || _type == 1, 'Transit: Type is not valid');

    bytes memory hashed;
    hashed = abi.encodePacked('shizo:transit:');
    for (uint i = 0; i < steps.length; i++) {
      uint256 tokenId = steps[i].tokenId;
      if (roadBlockStorage[tokenId].props.length > 0 && 
        roadBlockStorage[tokenId].props[roadBlockStorage[tokenId].props.length - 1].isBlock && 
        ownerOf(tokenId) != msg.sender) {
        // TODO use custom errors
        revert RoadBlocked(steps[i].tokenId);
      }

      if (i == 0) {
        hashed = abi.encodePacked(string(hashed), tokenId.toString(), ',', toString(steps[i].lat), ',', toString(steps[i].lon), ',', Strings.toString(steps[i].distance));
      } else {
        hashed = abi.encodePacked(string(hashed), ',', tokenId.toString(), ',', toString(steps[i].lat), ',', toString(steps[i].lon), ',', Strings.toString(steps[i].distance));
      }
    }
    address signer = hashed.toEthSignedMessageHash().recover(signature);
    require(owner == signer, 'Invalid signature');

    for (uint i = 0; i < steps.length; i++) {
      transits[msg.sender].steps.push(TransitStep(steps[i].tokenId, steps[i].lat, steps[i].lon, steps[i].distance));
    }
    
    transits[msg.sender].departureTime = block.timestamp;
    transits[msg.sender].t = _type;
  }

  function setStaticPositionByTransit() external {
    // TODO 
    // staticPositions[msg.sender] = Position(lat, lon);
  }

  function getDistanceTraversed() external view returns (uint16) {
    require(transits[msg.sender].departureTime != 0, 'No active transit');
    Transit memory transit = transits[msg.sender];
    uint16 deltaTime = uint16(block.timestamp - transit.departureTime);
    require(deltaTime < MAX_DELTA_TIME, 'Invalid transit');
    uint8 speed;
    if (transit.t == 0) {
      speed = WALK_SPEED;
    } else if (transit.t == 1) {
      speed = RUN_SPEED;
    } else {
      speed = TAXI_SPEED;
    }

    uint16 distance = deltaTime * speed;
    uint16 sumDistance = 0;
    uint time = transit.departureTime;
    for (uint i = 0; i < transit.steps.length; i++) {
      uint256 tokenId = transit.steps[i].tokenId;
      for (uint j = roadBlockStorage[tokenId].props.length - 1; j >= 0; j--) {
        if (roadBlockStorage[tokenId].props[j].modifiedTime < time && 
          (j == 0 || roadBlockStorage[tokenId].props[j - 1].modifiedTime >= time) && roadBlockStorage[tokenId].props[j].isBlock) {
          return sumDistance;
        }
      }
      if (sumDistance + transit.steps[i].distance > distance) {
        break;
      } else {
        sumDistance += transit.steps[i].distance;
        time += transit.steps[i].distance / speed;
      }
    }

    return distance;
  }
}
