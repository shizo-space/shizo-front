import { useRequest } from 'ahooks'
import useNearConnection from '../adaptors/near-connection/useNearConnection'
import { Provider } from 'near-api-js/lib/providers'

type GetPriceType = {
  priceStr: string
  price: number
}

async function getPrice(mergeId: string | null, provider: Provider): Promise<GetPriceType | null> {
  if (!mergeId || !provider) {
    return null
  }

  const rawResult: any = await provider.query({
    request_type: 'call_function',
    account_id: 'market.shizotest.testnet',
    method_name: 'get_sale',
    args_base64: btoa(JSON.stringify({ nft_contract_token: `shizotest.testnet.${mergeId}` })),
    finality: 'optimistic',
  })

  // format result
  const res = JSON.parse(Buffer.from(rawResult.result).toString())
  if (!res) {
    return null
  }
  const priceStr = res.sale_conditions
  const price = parseFloat(priceStr) / Math.pow(10, 24)
  return { priceStr, price }
}

type PriceType = {
  loading: boolean
  price: number | null | undefined
  priceStr: string | null | undefined
}

function useGetPrice(mergeId: string | null): PriceType {
  const { provider } = useNearConnection()
  const { data, loading, error } = useRequest<GetPriceType | null, []>(() => getPrice(mergeId, provider), {
    refreshDeps: [mergeId, provider],
  })
  return {
    price: error ? null : data?.price,
    priceStr: error ? null : data?.priceStr,
    loading,
  }
}

export default useGetPrice
