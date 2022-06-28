type Chain = {
  tokenBridgeAddress: string
  wChainId: number
  chainId: number
  chainName: string
  fullChainName: string
  rpcURL: string
  currencySymbol: string
  blockExplorer: string
  externalRpcURL?: string
  logoURI: string
  baseToken: Token
}
type SimpleChain = {
  chainName: string
  chainId: number
  rpcURL: string
  baseToken: Token
}
type Token = {
  name: string
  symbol: string
  solanaContract?: string
  isSolanaNative?: boolean
  ethContract?: string
  chainId: number
  wChainId?: number
  chainName: string
  decimals: number
  logoURI: string
  wrappedAddress?: string
  tokenBridgeAddress?: string
  // coingeckoId: string
  realOriginChainId?: number
  realOriginContractAddress?: string
}

type WalletContext = {
  chains: Chain[] | SimpleChain[]
  currentChain?: Chain | SimpleChain
  isWalletInstalled: boolean
  isWalletConnectedToNode: boolean
  userWalletAddress: string | null
  walletChainId: number | null
  isWalletChainIdOK: boolean
  changeChainId: (chain: Chain) => void
  isChangingChainIdLoading: boolean
  changeChainIdError: any
  connectWallet: () => void
  isConnectWalletLoading: boolean
  connectWalletError: any
  isWalletReady: boolean
  evmProvider?: import('ethers').ethers.providers.Web3Provider | null
  evmWallet?: import('ethers').ethers.providers.ExternalProvider
  signer?: import('ethers').ethers.Signer
  signMessage: any
  isWalletConnectedToSite: boolean
  activeWalletAddress?: string | null
  addToken: (tokenAddress: string, symbol: string, image?: string, decimals: number) => void
  isAddTokenLoading: boolean
  addTokenError: any
}

type EvmProviderContext = {
  chains: Chain[] | SimpleChain[]
  currentChain: Chain | SimpleChain
  defaultProvider: import('ethers').providers.JsonRpcProvider
  switchEvmChain: (chain: Chain) => void
  switchEvmChainLoading: boolean
  switchEvmChainError: any
  // tokens: Token[]
}

type Position = {
  lat: number
  lon: number
}

type TransitStep = {
  tokenId: number
  lat: number // 10 ** 6
  lon: number // 10 ** 6
  distance: number
}
