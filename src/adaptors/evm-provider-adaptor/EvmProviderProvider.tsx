import React, { useMemo, FC, useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import useEvmWallet from '../evm-wallet-adaptor/useEvmWallet'
import { Provider } from './context'
import { evmChains } from '../../configs'
import { useRequest } from 'ahooks'

type EvmProviderProviderProps = {
  chains?: Chain[]
}

const EvmProviderProvider: FC<EvmProviderProviderProps> = ({ children, chains = evmChains }) => {
  const { currentChain: walletCurrentChain, isWalletChainIdOK, isWalletConnectedToSite, changeChainId } = useEvmWallet()

  const [currentChain, setCurrentChain] = useState<Chain | SimpleChain>(walletCurrentChain || chains[0])

  useEffect(() => {
    if (isWalletChainIdOK && walletCurrentChain) {
      setCurrentChain(walletCurrentChain)
    }
  }, [walletCurrentChain, isWalletChainIdOK])

  const switchEvmChainService = useCallback(
    async (chain: Chain): Promise<void> => {
      if (isWalletConnectedToSite && isWalletChainIdOK) {
        changeChainId(chain)
      } else {
        setCurrentChain(currentChain)
      }
    },
    [isWalletConnectedToSite, isWalletChainIdOK],
  )

  const defaultProvider = useMemo<ethers.providers.JsonRpcProvider>(
    () => new ethers.providers.JsonRpcProvider(currentChain.rpcURL),
    [currentChain],
  )

  const {
    run: switchEvmChain,
    loading: switchEvmChainLoading,
    error: switchEvmChainError,
  } = useRequest(switchEvmChainService, {
    manual: true,
  })

  const providedContext: EvmProviderContext = {
    chains,
    currentChain,
    defaultProvider,
    switchEvmChain,
    switchEvmChainLoading,
    switchEvmChainError,
  }
  return <Provider value={providedContext}>{children}</Provider>
}

export default EvmProviderProvider
