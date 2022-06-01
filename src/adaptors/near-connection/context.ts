import { createContext } from 'react'

export type NearConnectionContextType = {
  isLoading: boolean
  error: any
  keyStore: any
  connection: any
  provider: any
}

export const NearConnectionProvider = createContext<NearConnectionContextType | null>(null)

export const Provider = NearConnectionProvider.Provider

export const context = NearConnectionProvider
