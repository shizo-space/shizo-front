import axios from 'axios'
import { ethers } from 'ethers'
import { GraphQLClient } from 'graphql-request'

export async function getPurchases(mergeId: string) {
  if (!mergeId) return
  const { data } = await axios.post('https://map.metagate.land/subgraphs/name/metagate/metagate', {
    query: `query {
      purchases(where: {tokenId: "${mergeId}"}, orderBy: timestamp) {
      buyer
      seller
      price
      timestamp
      }
    }`,
  })
  return data?.data?.purchases.map(p => ({
    ...p,
    date: new Date(p.timestamp * 1000).toISOString(),
    priceStr: ethers.utils.formatEther(p.price),
  }))
}

export async function getMint(mergeId: string) {
  if (!mergeId) return
  const { data } = await axios.post('https://map.metagate.land/subgraphs/name/metagate/metagate', {
    query: `query {
      mints(where: {tokenId: "${mergeId}"}, orderBy: timestamp) {
      to
      timestamp
      }
    }`,
  })
  console.log(data)
  const mints = data?.data?.mints.map(m => ({
    ...m,
    buyer: m.to,
    price: ethers.utils.parseEther('1'),
    priceStr: '1',
    date: new Date(m.timestamp * 1000).toISOString(),
  }))

  return mints[0]
}
