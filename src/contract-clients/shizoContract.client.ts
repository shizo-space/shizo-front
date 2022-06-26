import { useRequest } from 'ahooks'
import { BigNumber, ethers } from 'ethers'
import Contracts from '../contracts/hardhat_contracts.json'
import NodeWorker from '../adaptors/evm-provider-adaptor/NodeWorker'
import useEvmProvider from '../adaptors/evm-provider-adaptor/hooks/useEvmProvider'
import useEvmWallet from '../adaptors/evm-wallet-adaptor/useEvmWallet'

function getCnt(currentChain: SimpleChain) {
  const { chainId, chainName } = currentChain
  return Contracts[chainId]?.[chainName]?.contracts['Shizo']
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
  mergeId: string,
  type: number,
  rarity: number,
  lat: number,
  lon: number,
  signature: string,
  address: string | null,
  currentChain: SimpleChain,
  signer: ethers.Signer,
): Promise<void> {
  if (!signer || !address || !currentChain) {
    return
  }
  const contract = getWriteContract(currentChain, signer)
  const service = async function () {
    await contract.mint(
      mergeId,
      type,
      rarity,
      Math.floor(lat * 10 ** 6),
      Math.floor(lon * 10 ** 6),
      Buffer.from(signature),
      {
        value: ethers.utils.parseEther('0.001'),
      },
    )
  }
  return NodeWorker.async(service)
}

export async function getOwnerOf(
  mergeId: string,
  currentChain: SimpleChain,
  provider: ethers.providers.Provider,
): Promise<string | null> {
  if (!mergeId || !currentChain || !provider) {
    return
  }

  const contract = getReadContract(currentChain, provider)
  const service = async function () {
    return await contract.ownerOf(mergeId)
  }
  return NodeWorker.async(service)
}

export async function getMarketDetails(
  mergeId: string,
  currentChain: SimpleChain,
  provider: ethers.providers.Provider,
): Promise<any> {
  if (!mergeId || !currentChain || !provider) {
    return
  }

  const contract = getReadContract(currentChain, provider)
  const service = async function () {
    return await contract.marketplace(mergeId)
  }
  return NodeWorker.async(service)
}

export async function setPrice(
  mergeId: string,
  price: string,
  currentChain: SimpleChain,
  signer: ethers.Signer,
): Promise<void> {
  if (!signer || !price || !currentChain) {
    return
  }
  const contract = getWriteContract(currentChain, signer)
  const service = async function () {
    await contract.listOnMarketplace(mergeId, ethers.utils.parseEther(price))
  }
  return NodeWorker.async(service)
}

export async function purchase(
  mergeId: string,
  price: BigNumber,
  currentChain: SimpleChain,
  signer: ethers.Signer,
): Promise<void> {
  if (!signer || !price || !currentChain) {
    return
  }
  const contract = getWriteContract(currentChain, signer)
  const service = async function () {
    await contract.purchase(mergeId, { value: price })
  }
  return NodeWorker.async(service)
}
