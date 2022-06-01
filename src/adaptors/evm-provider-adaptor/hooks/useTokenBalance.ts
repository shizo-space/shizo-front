import { useRequest, useUpdateEffect } from 'ahooks'
import { ethers } from 'ethers'
import ERC20Artifact from '../../../contracts/ERC20.json'
import NodeWorker from '../NodeWorker'
import { getDisplayAmount } from '../helper'
import useEvmProvider from './useEvmProvider'
import useNewBlock from './useNewBlock'
import useEvmWallet from '../../evm-wallet-adaptor/useEvmWallet'
import { Balance, getBalance } from './useBalance'
import { useState } from 'react'

const emptyResult: Balance = { amount: null, displayAmount: null, decimals: null }

let cache: {
  [index: string]: {
    blockNumber: number
    chainId: number
    balanceData: Balance
  } | null
} = {}

export async function getTokenBalance(
  token: Token,
  ownerAddress: string | null | undefined,
  blockNumber: number,
  chainId: number,
  provider: ethers.providers.JsonRpcProvider,
): Promise<Balance> {
  if (!token || !provider || !ownerAddress) {
    return emptyResult
  }
  if (cache[token.ethContract]) {
    const prevData = cache[token.ethContract]
    if (prevData.chainId === chainId && blockNumber - prevData.blockNumber < 3) {
      return prevData.balanceData
    } else {
      cache[token.ethContract] = null
    }
  }
  if (token.ethContract === ethers.constants.AddressZero) {
    const data = await getBalance(ownerAddress, provider)
    cache[token.ethContract] = {
      blockNumber,
      chainId,
      balanceData: data,
    }
    return data
  }
  const contract = new ethers.Contract(token.ethContract, ERC20Artifact.abi, provider)
  const service = async function () {
    const amount = await contract.balanceOf(ownerAddress)
    const displayAmount = getDisplayAmount(amount, token.decimals)
    const data: Balance = { amount, displayAmount, decimals: token.decimals }
    cache[token.ethContract] = {
      blockNumber,
      chainId,
      balanceData: data,
    }
    return data
  }
  return NodeWorker.async(service)
}

function useTokenBalance(token: Token) {
  const blockNumber = useNewBlock()
  const [result, setResult] = useState<Balance>(emptyResult)
  const { defaultProvider: provider, currentChain } = useEvmProvider()
  const { activeWalletAddress } = useEvmWallet()
  const { data, loading } = useRequest(() => getTokenBalance(token, activeWalletAddress, 0, currentChain.chainId, provider), {
    onError: err => {
      console.error(err)
    },
    onSuccess: res => {
      setResult(res)
    },
    refreshDeps: [token, activeWalletAddress, provider, blockNumber, currentChain],
  })
  useUpdateEffect(() => {
    setResult(emptyResult)
  }, [activeWalletAddress, currentChain.chainId])
  return { ...result, loading }
}

export default useTokenBalance
