/*
func (r *Ride) Progress(milliseconds float64) bool {
    if milliseconds < 0 {
        return true
    }
    speed := GetSpeedInKilometers(r.vehicle)

    totalTimeBudgetSpent := 0.0

    if r.currentPathIndex >= len(r.path)-1 {
        return true
    }
    distanceToNextPathNode := get_distance(r.currentLat, r.currentLong, r.path[r.currentPathIndex+1].Lat, r.path[r.currentPathIndex+1].Long)
    timeToNextPathNodeInMS := 1000 * 3600 * distanceToNextPathNode / speed
    if timeToNextPathNodeInMS >= milliseconds {
        portion := milliseconds / timeToNextPathNodeInMS
        r.currentLat += portion * (r.path[r.currentPathIndex+1].Lat - r.currentLat)
        r.currentLong += portion * (r.path[r.currentPathIndex+1].Long - r.currentLong)
        return false
    }

    totalTimeBudgetSpent += timeToNextPathNodeInMS
    for {
        r.currentPathIndex++
        if r.currentPathIndex >= len(r.path)-1 {
            return true
        }
        r.currentLat = r.path[r.currentPathIndex].Lat
        r.currentLong = r.path[r.currentPathIndex].Long
        distanceToNextPathNode = get_distance(r.currentLat, r.currentLong, r.path[r.currentPathIndex+1].Lat, r.path[r.currentPathIndex+1].Long)
        timeToNextPathNodeInMS = 1000 * 3600 * distanceToNextPathNode / speed
        totalTimeBudgetSpent += timeToNextPathNodeInMS
        if totalTimeBudgetSpent >= milliseconds {
            portion := (milliseconds - (totalTimeBudgetSpent - timeToNextPathNodeInMS)) / timeToNextPathNodeInMS
            r.currentLat += portion * (r.path[r.currentPathIndex+1].Lat - r.currentLat)
            r.currentLong += portion * (r.path[r.currentPathIndex+1].Long - r.currentLong)
            return false
        }
    }
}
*/

const asin = Math.asin
const cos = Math.cos
const sin = Math.sin
const sqrt = Math.sqrt
const PI = Math.PI

// equatorial mean radius of Earth (in meters)
const R = 6378137

function squared(x) {
  return x * x
}
function toRad(x) {
  return (x * PI) / 180.0
}
function hav(x) {
  return squared(sin(x / 2))
}

// hav(theta) = hav(bLat - aLat) + cos(aLat) * cos(bLat) * hav(bLon - aLon)
export function haversineDistance(a, b) {
  const aLat = toRad(Array.isArray(a) ? a[1] : a.latitude || a.lat)
  const bLat = toRad(Array.isArray(b) ? b[1] : b.latitude || b.lat)
  const aLng = toRad(Array.isArray(a) ? a[0] : a.longitude || a.lng || a.lon)
  const bLng = toRad(Array.isArray(b) ? b[0] : b.longitude || b.lng || b.lon)

  const ht = hav(bLat - aLat) + cos(aLat) * cos(bLat) * hav(bLng - aLng)
  return 2 * R * asin(sqrt(ht))
}
