import { ethers } from 'ethers'

declare global {
  interface Window {
    ethereum?: import('ethers').ethers.providers.ExternalProvider & {
      selectedAddress: string
      isConnected: () => boolean
      on: (event: string, callback: Function) => void
      removeListener: (event: string, callback: Function) => void
      chainId?: string | number
    }
  }
}

export async function requestChangeWalletChain(chain: Chain, externalProvider?: ethers.providers.ExternalProvider): Promise<void> {
  const _provider = externalProvider || window.ethereum
  const request = _provider?.request
  if (!request) {
    return
  }
  try {
    const res = await request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${Number(chain.chainId).toString(16)}` }],
    })
  } catch (e: any) {
    //probably error.code === 4902
    if (e?.code === 4902) {
      await request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${Number(chain.chainId).toString(16)}`,
            rpcUrls: [chain.rpcURL],
            chainName: chain.fullChainName,
          },
        ],
      })
    }
    throw e
  }
}

export async function connectWalletToSite(externalProvider?: ethers.providers.ExternalProvider): Promise<void> {
  const _provider = externalProvider || window.ethereum
  const request = _provider?.request
  if (!request) {
    return
  }
  try {
    const addresses = await request({ method: 'eth_requestAccounts' })
    return addresses
  } catch (error: any) {
    // EIP-1193 userRejectedRequest error
    if (error.code !== 4001) {
      throw error
    }
    throw error
  }
}

export async function addTokenToWallet(
  address: string,
  symbol: string,
  image?: string,
  decimals: number = 18,
  externalProvider?: ethers.providers.ExternalProvider,
): Promise<void> {
  const _provider = externalProvider || window.ethereum
  const request = _provider?.request
  if (!request) {
    return
  }
  try {
    const result = await request({
      method: 'wallet_watchAsset',
      params: {
        // @ts-ignore
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address, // The address that the token is at.
          symbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals, // The number of decimals in the token
          image, // A string url of the token logo
        },
      },
    })
  } catch (error) {
    console.error(error)
  }
}
