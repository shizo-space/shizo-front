import * as nearAPI from 'near-api-js'
import { useRequest } from 'ahooks'
import useNearConnection from '../adaptors/near-connection/useNearConnection'
import { Near } from 'near-api-js'
import { Provider } from 'near-api-js/lib/providers'
const { providers } = require('near-api-js')
//network config (replace testnet with mainnet or betanet)

async function getOwnerName(mergeId: string | null, provider: Provider): Promise<string | null> {
  if (!mergeId || !provider) {
    return null
  }

  const rawResult: any = await provider.query({
    request_type: 'call_function',
    account_id: 'shizotest.testnet',
    method_name: 'nft_token',
    args_base64: btoa(JSON.stringify({ token_id: mergeId })),
    finality: 'optimistic',
  })

  // format result
  const res = JSON.parse(Buffer.from(rawResult.result).toString())
  return res?.owner_id
}

type OwnerNameType = {
  loading: boolean
  name: string | null | undefined
}
function useGetOwnerName(mergeId: string | null): OwnerNameType {
  const { provider } = useNearConnection()
  const {
    data: name,
    loading,
    error,
  } = useRequest<string | null, []>(() => getOwnerName(mergeId, provider), {
    refreshDeps: [mergeId, provider],
  })
  return {
    name: error ? null : name,
    loading,
  }
}

export default useGetOwnerName
