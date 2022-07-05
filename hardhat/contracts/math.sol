pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

library math {
  bytes constant lookupTable = "\x00\x00\x04\x77\x08\xef\x0d\x65\x11\xdb\x16\x4f\x1a\xc2\x1f\x32\x23\xa0\x28\x0b\x2c\x74\x30\xd8\x35\x39\x39\x96\x3d\xee\x42\x41\x46\x8f\x4a\xd8\x4f\x1b\x53\x58\x57\x8e\x5b\xbd\x5f\xe5\x64\x06\x68\x1f\x6c\x30\x70\x38\x74\x38\x78\x2e\x7c\x1b\x7f\xff\x83\xd9\x87\xa8\x8b\x6c\x8f\x26\x92\xd5\x96\x78\x9a\x0f\x9d\x9b\xa1\x1a\xa4\x8d\xa7\xf2\xab\x4b\xae\x96\xb1\xd4\xb5\x04\xb8\x25\xbb\x39\xbe\x3d\xc1\x33\xc4\x1a\xc6\xf2\xc9\xba\xcc\x72\xcf\x1a\xd1\xb3\xd4\x3a\xd6\xb2\xd9\x18\xdb\x6e\xdd\xb2\xdf\xe6\xe2\x07\xe4\x18\xe6\x16\xe8\x02\xe9\xdd\xeb\xa5\xed\x5a\xee\xfe\xf0\x8e\xf2\x0c\xf3\x77\xf4\xcf\xf6\x14\xf7\x45\xf8\x64\xf9\x6f\xfa\x66\xfb\x4a\xfc\x1b\xfc\xd8\xfd\x81\xfe\x16\xfe\x97\xff\x05\xff\x5f\xff\xa5\xff\xd7\xff\xf5\xff\xff";
  // function abs(int16 n) public pure returns(uint16) {
    
  // }

  function distance2(int32 lat1, int32 lon1, int32 lat2, int32 lon2) internal pure returns(uint256) {
    int16 dlat = int16(lat2 - lat1);
    int16 dlon = int16(lon2 - lon1);
    // (cos(lat) * sin(lon) * dlon + cos(lon) * sin(lat) * dlat) ** 2 +  (sin(lat) * sin(lon) * dlon - cos(lon) * sin(lat) * dlat) ** 2
    int16 lat = int16(lat1 / 1000000);
    // int16 lon = int16(lon1 / 1000000);

    // https://www.themathdoctors.org/distances-on-earth-3-planar-approximation/
    int dx = int(dlon) * cos(lat);
    int dy = int(dlat) * 65535; // uint16 max value

    // int dx = cos(lat) * sin(lon) * dlon + cos(lon) * sin(lat) * dlat;
    // int dy = sin(lat) * sin(lon) * dlon - cos(lon) * sin(lat) * dlat;

    return uint256((dx * dx) + (dy * dy));
  }

  function sin(int16 angle) internal pure returns(int64) {
    int64 sign = 1;
    uint16 offset;
    if (angle >= 0) {
      offset = 2 * uint16(angle);
    } else {
      offset = 2 * uint16(-angle);
      sign = -1;
    }

    if (offset > 180) {
      offset = offset - 180;
    }

    offset += 2;

    bytes memory table = lookupTable;
    uint16 trigint_value;
    assembly {
        trigint_value := mload(add(table, offset))
    }

    return sign * int64(uint64(trigint_value));
  }

  function cos(int16 angle) internal pure returns(int64) {
    if (angle > 90) {
      return -1 * sin(angle - 90);
    }
    return sin(90 + angle);
  }
}