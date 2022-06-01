import { createContext } from 'react'

const EvmWalletContext = createContext<WalletContext | null>(null)

export const Provider = EvmWalletContext.Provider

export const context = EvmWalletContext
