import { useRequest } from 'ahooks'
import { BigNumber, ethers } from 'ethers'
import Contracts from '../contracts/hardhat_contracts.json'
import NodeWorker from '../adaptors/evm-provider-adaptor/NodeWorker'
import useEvmProvider from '../adaptors/evm-provider-adaptor/hooks/useEvmProvider'
import useEvmWallet from '../adaptors/evm-wallet-adaptor/useEvmWallet'

function getCnt(currentChain: SimpleChain) {
  const { chainId, chainName } = currentChain
  return Contracts[chainId]?.[chainName]?.contracts['Chest']
}

function getReadContract(currentChain: SimpleChain, provider: ethers.providers.Provider): ethers.Contract {
  const cnt = getCnt(currentChain)
  return new ethers.Contract(cnt.address, cnt.abi, provider)
}

function getWriteContract(currentChain: SimpleChain, signer: ethers.Signer): ethers.Contract {
  const cnt = getCnt(currentChain)
  return new ethers.Contract(cnt.address, cnt.abi, signer)
}

export async function mint(
  tokenId: string,
  address: string | null,
  currentChain: SimpleChain,
  signer: ethers.Signer,
): Promise<void> {
  if (!signer || !address || !currentChain) {
    return
  }
  const contract = getWriteContract(currentChain, signer)
  const service = async function () {
    await contract.mint(tokenId)
  }
  return NodeWorker.async(service)
}
