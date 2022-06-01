import { useState, useMemo, useEffect, useCallback, FC } from 'react'
import { useRequest } from 'ahooks'
import { ethers } from 'ethers'
import { connectWalletToSite, requestChangeWalletChain, addTokenToWallet } from './helper'
import { Provider } from './context'
import { evmChains } from '../../configs'

type EvmWalletProviderProps = {
    chains?: SimpleChain[]
}

const EvmWalletProvider: FC<EvmWalletProviderProps> = ({ children, chains = evmChains }) => {
    const evmWallet = useMemo(() => window.ethereum, [])

    const [evmProvider, setEvmProvider] = useState<ethers.providers.Web3Provider | null>(null)

    const [signer, setSigner] = useState<ethers.Signer | null>(null)

    const isWalletInstalled = useMemo<boolean>(() => !!(typeof evmWallet !== 'undefined' && evmWallet.isMetaMask), [evmWallet])

    const [userWalletAddress, setUserWalletAddress] = useState<string | null>(
        isWalletInstalled && evmWallet?.selectedAddress ? evmWallet.selectedAddress : null,
    )

    // Wallet connection to node
    const [isWalletConnectedToNode, setIsWalletConnectedToNode] = useState<boolean>(
        !!(isWalletInstalled && evmWallet && evmWallet.isConnected()),
    )

    const handleChangeWalletConnectionStatus = useCallback(() => {
        if (isWalletInstalled) {
            setUserWalletAddress(evmWallet?.selectedAddress ?? null)
            setIsWalletConnectedToNode(!!evmWallet?.isConnected())
        }
    }, [isWalletInstalled])

    useEffect(() => {
        async function check() {
            if (!evmWallet) {
                return
            }
            const provider = new ethers.providers.Web3Provider(evmWallet)
            const accounts = await provider.listAccounts()
            setUserWalletAddress(accounts[0])
            setWalletChainId((await provider.getNetwork()).chainId)
        }
        check()
    }, [])

    useEffect(() => {
        if (isWalletInstalled && evmWallet) {
            evmWallet.on('connect', handleChangeWalletConnectionStatus)
        }
        return () => {
            if (evmWallet) {
                evmWallet.removeListener('connect', handleChangeWalletConnectionStatus)
            }
        }
    }, [])

    useEffect(() => {
        if (isWalletInstalled && evmWallet) {
            evmWallet.on('disconnect', handleChangeWalletConnectionStatus)
        }
        return () => {
            if (evmWallet) {
                evmWallet.removeListener('disconnect', handleChangeWalletConnectionStatus)
            }
        }
    }, [])

    // Wallet account connection to site
    const handleChangeWalletAccounts = useCallback(
        accounts => {
            if (isWalletInstalled) {
                setUserWalletAddress(accounts[0])
            }
        },
        [isWalletInstalled],
    )

    useEffect(() => {
        if (isWalletInstalled && evmWallet) {
            evmWallet.on('accountsChanged', handleChangeWalletAccounts)
        }
        return () => {
            if (evmWallet) {
                evmWallet.removeListener('accountsChanged', handleChangeWalletAccounts)
            }
        }
    }, [])

    const {
        run: connectWallet,
        loading: isConnectWalletLoading,
        error: connectWalletError,
    } = useRequest(() => connectWalletToSite(), {
        manual: true,
    })

    // Wallet Chain id
    const [walletChainId, setWalletChainId] = useState<number | null>(
        isWalletInstalled && evmWallet?.chainId ? Number(evmWallet?.chainId) : null,
    )

    const handleChangeWalletNetwork = useCallback(
        chainId => {
            if (isWalletInstalled) {
                setWalletChainId(Number(chainId))
            }
        },
        [isWalletInstalled],
    )

    useEffect(() => {
        if (isWalletInstalled && evmWallet) {
            evmWallet.on('chainChanged', handleChangeWalletNetwork)
        }
        return () => {
            if (evmWallet) {
                evmWallet.removeListener('chainChanged', handleChangeWalletNetwork)
            }
        }
    }, [])

    const {
        run: changeChainId,
        loading: isChangingChainIdLoading,
        error: changeChainIdError,
    } = useRequest<void, [Chain]>((chain: Chain) => requestChangeWalletChain(chain), {
        manual: true,
    })

    const {
        run: addToken,
        loading: isAddTokenLoading,
        error: addTokenError,
    } = useRequest((tokenAddress, symbol, image = undefined, decimals = 18) => addTokenToWallet(tokenAddress, symbol, image, decimals), {
        manual: true,
    })

    const suitableChains = useMemo<number[]>(() => chains.map(c => c.chainId), chains)

    const isWalletConnectedToSite = !!userWalletAddress

    const isWalletChainIdOK = useMemo(
        () => !!(isWalletInstalled && walletChainId && suitableChains.includes(walletChainId)),
        [chains, isWalletInstalled, walletChainId, isWalletConnectedToSite],
    )

    const isWalletReady = isWalletConnectedToNode && isWalletConnectedToSite && isWalletChainIdOK

    useEffect(() => {
        if (isWalletReady && evmWallet) {
            const provider = new ethers.providers.Web3Provider(evmWallet)
            setEvmProvider(provider)
            setSigner(provider.getSigner(0))
        } else {
            setEvmProvider(null)
            setSigner(null)
        }
    }, [isWalletReady])

    const activeWalletAddress = useMemo<string | null>(() => (isWalletReady ? userWalletAddress : null), [userWalletAddress, isWalletReady])


    const { runAsync: signMessage } = useRequest<string | null, [string]>(
        message => signer.signMessage(message))

    const providedContext: WalletContext = {
        chains,
        currentChain: chains.find(c => c.chainId === walletChainId),
        isWalletInstalled,
        isWalletConnectedToNode,
        isWalletConnectedToSite,
        userWalletAddress,
        walletChainId,
        isWalletChainIdOK,
        changeChainId,
        isChangingChainIdLoading,
        changeChainIdError,
        connectWallet,
        isConnectWalletLoading,
        connectWalletError,
        isWalletReady,
        evmWallet,
        activeWalletAddress,
        evmProvider,
        addToken,
        isAddTokenLoading,
        addTokenError,
        signer,
        signMessage
    }

    return <Provider value={providedContext}>{children}</Provider>
}

export default EvmWalletProvider
