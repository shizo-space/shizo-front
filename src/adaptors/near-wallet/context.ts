import { Account, WalletConnection } from 'near-api-js'
import { createContext } from 'react'

export type NearWalletContextType = {
  isSignedIn: boolean
  signIn: any
  signOut: any
  wallet: WalletConnection
  account: Account
  accountId: string
  signMessage: any
}

export const NearWalletProvider = createContext<NearWalletContextType | null>(null)

export const Provider = NearWalletProvider.Provider

export const context = NearWalletProvider
