import polyline from '@mapbox/polyline'
import { haversineDistance } from './route'

export const calcPolyDistance = pline => {
  const coords = polyline.decode(pline, 6)
  console.log(coords)
  let sum = 0
  for (let i = 0; i < coords.length - 1; i++) {
    sum += haversineDistance([coords[i][1], coords[i][0]], [coords[i + 1][1], coords[i + 1][0]])
  }
  return sum
}
