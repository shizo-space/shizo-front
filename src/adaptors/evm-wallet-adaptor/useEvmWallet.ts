import { useContext } from 'react'

import { context } from './context'

function useEvmWallet(): WalletContext {
    const walletContext = useContext(context)

    if (!walletContext) {
        throw new Error('You should call useEvmWallet inside of EvmWalletProvider context ')
    }
    return walletContext
}

export default useEvmWallet
