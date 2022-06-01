import * as nearAPI from 'near-api-js'
import { useRequest } from 'ahooks'
import { Contract, WalletConnection } from 'near-api-js'
import { useMemo } from 'react'
import { toYoktoNear } from '../utils'

function getContract(wallet: WalletConnection): Contract | null {
  return new nearAPI.Contract(wallet.account(), 'shizotest.testnet', {
    viewMethods: ['nft_tokens_for_owner'],
    changeMethods: ['nft_mint', 'nft_approve'],
  })
}

async function mint(contract: any, receiverId: string | undefined, mergeId: string) {
  if (!receiverId) {
    return
  }
  await contract.nft_mint(
    {
      token_id: mergeId,
      receiver_id: receiverId,
    },
    '90000000000000',
    toYoktoNear(10),
  )
}

async function setLandForSale(contract: any, mergeId: string, newPrice: string) {
  await contract.nft_approve(
    {
      token_id: mergeId,
      account_id: 'market.shizotest.testnet',
      msg: JSON.stringify({
        sale_conditions: newPrice,
      }),
    },
    '90000000000000',
    '360000000000000000000',
  )
}

async function getAllOfMyLands(contract: any, accountId: string | undefined) {
  if (!accountId) {
    return
  }

  const res = await contract.nft_tokens_for_owner({ account_id: accountId })
  return res
}

function useNftContract(wallet: WalletConnection | null) {
  const contract = useMemo(() => {
    if (!wallet) {
      return
    }

    return getContract(wallet)
  }, [wallet])
  const { run: mintNft } = useRequest<void, [string]>(mergeId => mint(contract, wallet?.account().accountId, mergeId), {
    manual: true,
  })
  const { run: setForSale } = useRequest<void, [string, string]>((mergeId, newPrice) => setLandForSale(contract, mergeId, newPrice), {
    manual: true,
  })
  const { data: properties } = useRequest<any, [string]>(() => getAllOfMyLands(contract, wallet?.account().accountId), {
    refreshDeps: [wallet?.account().accountId],
  })
  return {
    mintNft,
    setForSale,
    properties,
  }
}

export default useNftContract
