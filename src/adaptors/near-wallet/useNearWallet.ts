import { useContext } from 'react'

import { context, NearWalletContextType } from './context'

function useNearWallet(): NearWalletContextType {
  const NearWalletContext = useContext(context)
  if (!NearWalletContext) {
    throw new Error('You should call useNearWallet inside of NearWalletProvider context ')
  }

  const { isSignedIn, signIn, wallet, signOut, signMessage } = NearWalletContext
  const account = wallet?.account()
  return {
    isSignedIn,
    signIn,
    wallet,
    account,
    accountId: account?.accountId,
    signOut,
    signMessage,
  }
}

export default useNearWallet
