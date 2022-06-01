import { useCallback, useEffect, useMemo, useState } from 'react'
import useEvmProvider from './useEvmProvider'

function useNewBlock() {
  const { defaultProvider: provider } = useEvmProvider()

  const [blockNumber, setBlockNumber] = useState(null)

  const handleNewBlock = useCallback(newBlockNumber => {
    setBlockNumber(newBlockNumber)
  }, [])

  useEffect(() => {
    if (provider) {
      provider.on('block', handleNewBlock)
    }
    return () => {
      if (provider) {
        provider.off('block', handleNewBlock)
      }
    }
  }, [provider])

  return Math.floor(blockNumber / 3)
}

export default useNewBlock
