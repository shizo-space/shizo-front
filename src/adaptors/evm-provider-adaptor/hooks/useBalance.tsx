import { useRequest, useUpdateEffect } from 'ahooks'
import { ethers } from 'ethers'
import ERC20Artifact from '../../../contracts/ERC20.json'
import NodeWorker from '../NodeWorker'
import { getDisplayAmount } from '../helper'
import useEvmProvider from './useEvmProvider'
import useNewBlock from './useNewBlock'
import useEvmWallet from '../../evm-wallet-adaptor/useEvmWallet'
import { useEffect, useState } from 'react'

export type Balance = {
  amount: ethers.BigNumberish | null
  displayAmount: number | null
  decimals: number | null
}

const emptyResult: Balance = { amount: null, displayAmount: null, decimals: null }

export async function getBalance(ownerAddress: string | null | undefined, provider: ethers.providers.JsonRpcProvider): Promise<Balance> {
  if (!provider || !ownerAddress) {
    return emptyResult
  }
  const service = async function () {
    const amount = await provider.getBalance(ownerAddress)
    const displayAmount = ethers.utils.formatEther(amount)
    return { amount, displayAmount, decimals: 18 }
  }
  return NodeWorker.async(service)
}

function useBalance() {
  const newBlock = useNewBlock()
  const [result, setResult] = useState<Balance>(emptyResult)
  const { defaultProvider: provider, currentChain } = useEvmProvider()
  const { activeWalletAddress } = useEvmWallet()
  const { loading } = useRequest(() => getBalance(activeWalletAddress, provider), {
    onError: err => {
      console.error(err)
    },
    onSuccess: res => {
      setResult(res)
    },
    refreshDeps: [activeWalletAddress, provider, newBlock, currentChain],
  })
  useUpdateEffect(() => {
    setResult(emptyResult)
  }, [activeWalletAddress, currentChain])
  return { ...result, loading }
}

export default useBalance
