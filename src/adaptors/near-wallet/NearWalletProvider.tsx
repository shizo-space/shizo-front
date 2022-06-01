import { useRequest } from 'ahooks'
import * as nearAPI from 'near-api-js'
import { KeyStore } from 'near-api-js/lib/key_stores'
import { FC, useMemo } from 'react'
import useNearConnection from '../near-connection/useNearConnection'
import { Provider, NearWalletContextType } from './context'
import { binary_to_base58 } from 'base58-js'

const { WalletConnection } = nearAPI

const signInToWallet = async wallet => {
  // check if near is defined and no error for connect and ...
  if (!wallet) {
    console.error('Wallet is null!')
    return
  }

  if (wallet.isSignedIn()) {
    console.error('Already signed in!')
    return
  }

  await wallet.requestSignIn(
    'shizotest.testnet', // contract requesting access
    'Shizo', // optional
  )
}

const signOutFromWallet = wallet => {
  if (!wallet) {
    console.error('Wallet is null!')
    return
  }

  if (!wallet.isSignedIn()) {
    console.error('Already signed out!')
    return
  }

  wallet.signOut()
  window.location.reload()
}

const signMsg = async (keyStore: KeyStore, accountId: string | undefined, message): Promise<string> => {
  if (!accountId) {
    return ''
  }
  const keyPair = await keyStore.getKey('testnet', accountId)
  const msg = Buffer.from(message)

  const { signature } = keyPair.sign(msg)
  const result = binary_to_base58(signature)
  return result
}

const NearWalletProvider: FC = ({ children }) => {
  const { connection, error: connectionError, keyStore } = useNearConnection()

  const wallet = useMemo(() => {
    if (!connection) {
      console.error(connectionError)
      return
    }

    return new WalletConnection(connection, null)
  }, [connection])

  const { run: signIn } = useRequest(() => signInToWallet(wallet), {
    manual: true,
  })

  const { runAsync: signMessage } = useRequest<string | null, [string]>(
    message => signMsg(keyStore, wallet?.account().accountId, message),
    {
      manual: true,
    },
  )

  const isSignedIn = wallet ? wallet.isSignedIn() : false

  const providedContext = {
    signIn,
    signOut: () => signOutFromWallet(wallet),
    isSignedIn,
    wallet,
    signMessage,
  } as NearWalletContextType

  return <Provider value={providedContext}>{children}</Provider>
}

export default NearWalletProvider
