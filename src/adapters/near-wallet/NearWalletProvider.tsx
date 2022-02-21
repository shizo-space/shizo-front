import { useRequest } from 'ahooks'
import * as nearAPI from 'near-api-js'
import { FC, useMemo } from 'react'
import useNearConnection from '../near-connection/useNearConnection'
import { Provider, NearWalletContextType } from './context'

const { WalletConnection } = nearAPI

const signInToWallet = async wallet => {
  // check if near is defined and no error for connect and ...
  if (!wallet) {
    console.error('Wallet is null!')
    return
  }

  if (wallet.isSignedIn()) {
    console.error('Already signed in!')
    console.log(wallet)
    return
  }

  console.log('signing in')
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

  console.log('signing out')
  wallet.signOut()
  window.location.reload()
}

const NearWalletProvider: FC = ({ children }) => {
  const { connection, error: connectionError } = useNearConnection()

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

  const isSignedIn = wallet ? wallet.isSignedIn() : false

  const providedContext = {
    signIn,
    signOut: () => signOutFromWallet(wallet),
    isSignedIn,
    wallet,
  } as NearWalletContextType

  return <Provider value={providedContext}>{children}</Provider>
}

export default NearWalletProvider
