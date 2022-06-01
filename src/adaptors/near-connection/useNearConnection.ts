import { useContext } from 'react'

import { context, NearConnectionContextType } from './context'

function useNearConnection(): NearConnectionContextType {
  const NearProviderContext = useContext(context)
  if (!NearProviderContext) {
    throw new Error('You should call useNearConnection inside of NearProvider context ')
  }

  const { connection, error, isLoading, provider, keyStore } = NearProviderContext
  return {
    connection,
    error,
    isLoading,
    provider,
    keyStore,
  }
}

export default useNearConnection
