import axios from 'axios'

export async function getSpawneds() {
  const { data } = await axios.post('http://localhost:8000/subgraphs/name/shizo', {
    query: `query {
      spawneds {
        id
        lat
        lon
        tokenId
        t
        tier
      }
    }`,
  })
  console.log(data)
  return data?.data?.spawneds.map(s => ({
    ...s,
    lat: s.lat / 10 ** 6,
    lon: s.lon / 10 ** 6,
  }))
}
