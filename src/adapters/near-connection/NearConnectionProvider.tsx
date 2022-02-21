import * as nearAPI from 'near-api-js'
import { ConnectConfig } from 'near-api-js'
import { FC } from 'react'
import { useAsync } from 'react-async'
import { Provider, NearConnectionContextType } from './context'

const { connect, keyStores, providers } = nearAPI

const connectToNear = async () => {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore()
  console.log(keyStore)
  return connect({
    headers: {},
    keyStore,
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org',
  } as ConnectConfig)
}

const NearConnectionProvider: FC = ({ children }) => {
  const { data, error, isLoading } = useAsync({ promiseFn: connectToNear })

  const providedContext: NearConnectionContextType = {
    connection: data,
    provider: new providers.JsonRpcProvider('https://rpc.testnet.near.org'),
    error,
    isLoading,
  }

  return <Provider value={providedContext}>{children}</Provider>
}

export default NearConnectionProvider
