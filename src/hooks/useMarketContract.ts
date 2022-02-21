import * as nearAPI from 'near-api-js'
import { useRequest } from 'ahooks'
import { Contract, WalletConnection } from 'near-api-js'
import { useMemo } from 'react'

function getContract(wallet: WalletConnection): Contract | null {
  return new nearAPI.Contract(wallet.account(), 'market.shizotest.testnet', {
    viewMethods: [],
    changeMethods: ['offer', 'update_price'],
  })
}

async function buyLand(contract: any, mergeId: string, price: string) {
  await contract.offer(
    {
      nft_contract_id: 'shizotest.testnet',
      token_id: mergeId,
    },
    '90000000000000',
    price,
  )
}

async function changeLandPrice(contract: any, mergeId: string, newPrice: string) {
  await contract.update_price(
    {
      nft_contract_id: 'shizotest.testnet',
      token_id: mergeId,
      price: newPrice,
    },
    '90000000000000',
    '1',
  )
}

function useMarketContract(wallet: WalletConnection | null) {
  const contract = useMemo(() => {
    if (!wallet) {
      return
    }

    return getContract(wallet)
  }, [wallet])
  const { run: buy } = useRequest<void, [string, string]>((mergeId, price) => buyLand(contract, mergeId, price), {
    manual: true,
  })

  const { run: updatePrice } = useRequest<void, [string, string]>((mergeId, newPrice) => changeLandPrice(contract, mergeId, newPrice), {
    manual: true,
  })
  return {
    buy,
    updatePrice,
  }
}

export default useMarketContract
