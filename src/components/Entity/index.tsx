import React, { FC, useMemo, useState } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import { CustomIconButton } from '../../custom-mui-components/index'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ReactComponent as FocusOnMap } from '../../assets/focus-dark.svg'
import { ReactComponent as Share } from '../../assets/share-dark.svg'
import { ReactComponent as TeleportIcon } from '../../assets/teleport.svg'
import { ReactComponent as NavigationIcon } from '../../assets/Navigation.svg'
import { ReactComponent as PolygonIcon } from '../../assets/polygon.svg'
import { ReactComponent as CloseIcon } from '../../assets/close-button.svg'
import { ReactComponent as TaxiIcon } from '../../assets/Taxi.svg'
import { ReactComponent as ShenIcon } from '../../assets/ShenIconColor.svg'
import { ReactComponent as MaticIcon } from '../../assets/MaticIcon.svg'

import ChangePriceModal from '../ChangePriceModal'
import OpenExternalWebsiteDialog from '../OpenExternalWebsiteDialog'
import { Paper } from '@mui/material'

import useEvmWallet from '../../adaptors/evm-wallet-adaptor/useEvmWallet'
import {
    mint,
    getOwnerOf,
    getMarketDetails,
    purchase,
    teleport,
    mintByShen,
} from '../../contract-clients/shizoContract.client'
import { useRequest } from 'ahooks'
import useEvmProvider from '../../adaptors/evm-provider-adaptor/hooks/useEvmProvider'
import { shortenAddress } from '../../utils'
import { BigNumber, ethers } from 'ethers'
import useNewBlock from '../../adaptors/evm-provider-adaptor/hooks/useNewBlock'
// import { getMint, getPurchases } from '../../gql'
import Chart from '../Chart'
import { allowance, approve, balanceOf } from '../../contract-clients/shenContract.client'
import ItemSummarySegment from '../ItemSummarySegment'
import { MaticRequiredForMint, Rarity, ShenRequiredForMint } from '../../constants'

const MAX_ALLOWANCE_AMOUNT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
const MINIMUM_SHEN_REQUIRED = ethers.utils.parseEther('10')

const useStyle = makeStyles((theme: any) => ({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: 400,
        height: '100vh',
        paddingTop: 128,
        backgroundColor: theme?.palette?.mode === 'dark' ? 'rgba(11, 18, 22, 0.95)' : '#FFF',
        zIndex: 2,
        overflowX: 'hidden',
        overflowY: 'auto',
    },
    content: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
    },
    loading: {
        alignSelf: 'center',
    },
    itemSummary: {
        marginBottom: 30,
    },
    top: {
        flexGrow: 1,
        flexShrink: 0,
    },
    topInfo: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    nameSegment: {
        flexGrow: 1,
    },
    container: {
        display: 'flex',
        alignItems: 'center',
    },
}))

type EntityProps = {
    data: any
    loading: boolean
    playerPosition: any
    onFocus: (data) => void
    onEdit: (data) => void
	onNavigate: (data) => void
    onRoute: (polyline) => void
}

const Entity: FC<EntityProps> = ({ data, loading, playerPosition, onFocus, onEdit, onNavigate, onRoute }) => {
    const classes = useStyle()
    const [showTooltip, setShowTooltip] = useState<boolean>(false)
    const [showChart, setShowChart] = useState<boolean>(false)
    const [showWebsiteDialog, setShowWebsiteDialog] = useState<boolean>(false)
    const [showChangePriceModal, setShowChangePriceModal] = useState<boolean>(false)
    const [ownerAddress, setOwnerAddress] = useState<string | null>(null)
    const [shenBalance, setShenBalance] = useState<BigNumber>(ethers.utils.parseEther('0'))
    const [purchases, setPurchases] = useState(null)
    const [mintData, setMintData] = useState(null)
    const [price, setPrice] = useState<BigNumber | null>(null)
    const [forSale, setForSale] = useState<boolean>(false)
    const { defaultProvider: provider, currentChain } = useEvmProvider()
    const { activeWalletAddress, signer } = useEvmWallet()
    const block = useNewBlock()
    const { runAsync: mintNft } = useRequest<void, [string]>(
        // TODO signature
        mergeId =>
            mint(
                mergeId,
                data.isBuilding ? 0 : 1,
                0,
                data.lat,
                data.lon,
                '',
                activeWalletAddress,
                currentChain,
                signer,
            ),
        {
            manual: true,
        },
    )

    const { runAsync: mintNftByShen } = useRequest<void, [string]>(
        // TODO signature
        mergeId =>
            mintByShen(
                mergeId,
                data.isBuilding ? 0 : 1,
                0,
                data.lat,
                data.lon,
                '',
                activeWalletAddress,
                currentChain,
                signer,
            ),
        {
            manual: true,
        },
    )

    const { run: buy } = useRequest<void, [string]>(
        mergeId => purchase(mergeId, price, currentChain, signer),
        {
            manual: true,
        },
    )

    const { run: teleportToLand } = useRequest<void, [string]>(
        mergeId => teleport(mergeId, currentChain, signer),
        {
            manual: true,
        },
    )

    const { loading: ownerAddressLoading } = useRequest<string, [string]>(
        () => getOwnerOf(data?.id, currentChain, provider),
        {
            onSuccess: address => {
                setOwnerAddress(address)
            },
            onError: _ => {
                setOwnerAddress(null)
            },
            refreshDeps: [data, provider, currentChain, block],
        },
    )

    const { loading: balanceLoading } = useRequest<BigNumber, [string]>(
        () => balanceOf(activeWalletAddress, currentChain, provider),
        {
            onSuccess: balance => {
                setShenBalance(balance)
            },
            onError: _ => {
                setShenBalance(ethers.utils.parseEther('0'))
            },
            refreshDeps: [data, provider, currentChain, block],
        },
    )

    const { loading: marketDetailsLoading } = useRequest<any, [string]>(
        () => getMarketDetails(data?.id, currentChain, provider),
        {
            onSuccess: marketDetails => {
                if (marketDetails?.listing) {
                    setForSale(true)
                    setPrice(marketDetails.price)
                } else {
                    setPrice(ShenRequiredForMint[data.rarity])
                }
            },
            onError: err => {
                console.error(err)
                setPrice(ShenRequiredForMint[data.rarity])
            },
            refreshDeps: [data, provider, currentChain, block],
        },
    )

    // const { loading: purchasesLoading } = useRequest<any, [void]>(() => getPurchases(data?.id), {
    //   onSuccess: res => {
    //     console.log(res)
    //     setPurchases(res)
    //   },
    //   onError: err => {
    //     console.error(err)
    //     setPurchases([])
    //   },
    //   refreshDeps: [data, currentChain, block],
    // })

    // const { loading: mintLoading } = useRequest<any, [void]>(() => getMint(data?.id), {
    //   onSuccess: res => {
    //     console.log(res)
    //     setMintData(res)
    //   },
    //   onError: err => {
    //     console.error(err)
    //     setMintData(null)
    //   },
    //   refreshDeps: [data, currentChain, block],
    // })

    const isOwnerOfEntity = useMemo(() => {
        return ownerAddress && ownerAddress === activeWalletAddress
    }, [activeWalletAddress, ownerAddress])

    const renderPrice = () => {
        const isShen = ownerAddress || shenBalance > MINIMUM_SHEN_REQUIRED

        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SvgIcon
                    component={isShen ? ShenIcon : MaticIcon}
                    viewBox='0 0 24 24'
                    sx={{ mr: 1.25, flexShrink: 0, mt: -0.5 }}
                />
                <Typography fontWeight={700} fontSize={35} sx={{ mr: 1 }}>
                    {isOwnerOfEntity && !forSale
                        ? '--'
                        : forSale
                        ? ethers.utils.formatEther(price)
                        : isShen
                        ? ethers.utils.formatEther(ShenRequiredForMint[data?.rarity] ?? ShenRequiredForMint[Rarity.Common])
                        : ethers.utils.formatEther(MaticRequiredForMint[data?.rarity] ?? MaticRequiredForMint[Rarity.Common])}
                </Typography>
                <Typography fontWeight={700} fontSize={18}>
                    {currentChain.baseToken.symbol}
                </Typography>
            </Box>
        )
    }

    const handleCloseTooltip = () => {
        try {
            setShowTooltip(false)
        } catch (e) {
            console.error(e)
        }
    }
    const handleOpenTooltip = e => {
        // e.stopPropagation();
        setShowTooltip(true)
        setTimeout(() => {
            handleCloseTooltip()
        }, 800)
    }

    async function checkAllowanceAndApprove() {
        const allowanceAmount = await allowance(activeWalletAddress, currentChain, provider)
        if (allowanceAmount.toHexString() !== MAX_ALLOWANCE_AMOUNT) {
            await approve(BigNumber.from(MAX_ALLOWANCE_AMOUNT), currentChain, signer)
        }
    }

    const handleMint = async () => {
        console.log(`Shen Balance: ${shenBalance}`)
        if (shenBalance >= MINIMUM_SHEN_REQUIRED) {
            await checkAllowanceAndApprove()
            await mintNftByShen(data.id)
        } else {
            await mintNft(data.id)
        }
    }

    const handleBuy = async () => {
        if (!price || !data?.id) {
            return
        }
        await buy(data.id)
    }

    return (
        <Box component={Paper} className={classes.root}>
            <Box className={classes.content}>
                {loading && (
                    <Box className={classes.loading}>
                        <CircularProgress />
                    </Box>
                )}
                {!loading && data && (
                    <>
                        <Box className={classes.itemSummary}>
                            <ItemSummarySegment {...data} />
                        </Box>
                        <Box className={classes.top}>
                            <Box className={classes.topInfo}>
                                <Box>
                                    <Box sx={{ mb: 0.25 }}>
                                        <Typography fontWeight={400} fontSize={16} color={'#808080'}>
                                            Owner
                                        </Typography>
                                    </Box>
                                    {ownerAddressLoading ? (
                                        <Skeleton width={100} height={18} />
                                    ) : (
                                        <Typography fontWeight={500} fontSize={20}>
                                            {ownerAddress?.length > 0
                                                ? shortenAddress(ownerAddress, 18, 4)
                                                : 'This selection has no owner'}
                                        </Typography>
                                    )}
                                </Box>
                                <Box>
                                    <Box sx={{ mb: 1.25 }}>
                                        <IconButton size='medium' onClick={() => onFocus(data)}>
                                            <SvgIcon
                                                component={FocusOnMap}
                                                viewBox='0 0 24 24'
                                                color='primary'
                                            />
                                        </IconButton>
                                    </Box>
                                    <CopyToClipboard
                                        text={`${window.location.host}/${data.id}`}
                                        onCopy={handleOpenTooltip}
                                    >
                                        <Tooltip
                                            title='Copied!'
                                            placement='top'
                                            disableFocusListener
                                            disableHoverListener
                                            disableTouchListener
                                            onClose={handleCloseTooltip}
                                            open={showTooltip}
                                        >
                                            <IconButton size='medium'>
                                                <SvgIcon
                                                    component={Share}
                                                    sx={{ color: 'transparent' }}
                                                    viewBox='0 0 24 24'
                                                />
                                            </IconButton>
                                        </Tooltip>
                                    </CopyToClipboard>
                                </Box>
                            </Box>
                            <Box>
                                <Box sx={{ mb: 0.25 }}>
                                    <Typography fontWeight={400} fontSize={16} color={'#808080'}>
                                        Message of Owner
                                    </Typography>
                                </Box>
                                {ownerAddressLoading ? (
                                    <Skeleton width={125} height={18} />
                                ) : (
                                    <Typography fontWeight={400} fontSize={16}>
                                        {data.description?.length > 0
                                            ? data.description
                                            : "This selection doesn't have any messages"}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Box>
                            {marketDetailsLoading ? (
                                <Box className={classes.container} sx={{ mb: 2.25 }}>
                                    <Skeleton width={104} height={18} />
                                </Box>
                            ) : ownerAddress && ownerAddress !== activeWalletAddress && !forSale ? null : (
                                <Box
                                    className={classes.container}
                                    sx={{ mb: 2.25, width: 1, justifyContent: 'space-between' }}
                                >
                                    {renderPrice()}
                                    {/* {isOwnerOfEntity && (
                    <Button
                      variant="text"
                      sx={{ color: '#6BDCC6', fontWeight: 500, fontSize: 16, lineHeight: '14px' }}
                      onClick={() => {
                        setShowChangePriceModal(true)
                      }}
                    >
                      {!forSale ? '(Set Price)' : '(Change Price)'}
                    </Button>
                  )} */}
                                    {isOwnerOfEntity && (
                                        <CustomIconButton
                                            size='medium'
                                            onClick={() => teleportToLand(data.id)}
                                            color='secondary'
                                        >
                                            <SvgIcon component={TeleportIcon} viewBox='0 0 24 24' />
                                        </CustomIconButton>
                                    )}
                                    {playerPosition && (
                                        <CustomIconButton
                                            size='medium'
                                            onClick={() => onNavigate(data)}
                                            color='secondary'
                                        >
                                            <SvgIcon
                                                component={NavigationIcon}
                                                viewBox='0 0 22 22'
                                                sx={{ padding: 0.15 }}
                                            />
                                        </CustomIconButton>
                                    )}
                                </Box>
                            )}
                            {/* 
              {!purchasesLoading && purchases?.length > 0 ? (
                <Button
                  sx={{
                    mb: 2,
                    border: '1px solid #6BDCC6',
                    color: '#FFF',
                    ':hover': { backgroundColor: 'rgba(0,0,0,0)', border: '1px solid #6BDCC6' },
                  }}
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => {
                    setShowChart(true)
                  }}
                >
                  Trading History
                </Button>
              ) : null} */}

                            {data.externalLink && (
                                <Button
                                    sx={{
                                        mb: 2,
                                        backgroundColor: '#0084FF',
                                        ':hover': { backgroundColor: '#0084FF' },
                                    }}
                                    variant='contained'
                                    fullWidth
                                    size='large'
                                    onClick={() => {
                                        setShowWebsiteDialog(true)
                                    }}
                                >
                                    Visit Website
                                </Button>
                            )}

                            {isOwnerOfEntity ? (
                                <Button
                                    disabled={ownerAddressLoading}
                                    sx={{ mb: 2 }}
                                    variant='contained'
                                    fullWidth
                                    size='large'
                                    style={{
                                        background:
                                            'linear-gradient(243.83deg, #5EBEDD 25.02%, #6BDCC6 62.79%)',
                                        fontWeight: 700,
                                    }}
                                    onClick={() => {
                                        onEdit(data)
                                    }}
                                >
                                    {ownerAddressLoading ? <Skeleton width={104} height={18} /> : 'Edit Land'}
                                </Button>
                            ) : ownerAddress && !forSale ? (
                                <Button
                                    sx={{ mb: 2, height: '54px', fontSize: '14px' }}
                                    disabled={true}
                                    variant='contained'
                                    fullWidth
                                    style={{
                                        background: 'rgba(242, 88, 34, 0.3)',
                                        color: 'rgba(242, 88, 34, 1)',
                                    }}
                                    size='large'
                                >
                                    {ownerAddressLoading ? (
                                        <Skeleton width={104} height={18} />
                                    ) : (
                                        'This land is not available for sale'
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    disabled={ownerAddressLoading}
                                    sx={{ mb: 2 }}
                                    variant='contained'
                                    fullWidth
                                    size='large'
                                    style={{
                                        background:
                                            'linear-gradient(243.83deg, #5EBEDD 25.02%, #6BDCC6 62.79%)',
                                        fontWeight: 700,
                                    }}
                                    onClick={() => {
                                        ownerAddress ? handleBuy() : handleMint()
                                    }}
                                >
                                    {ownerAddressLoading ? <Skeleton width={104} height={18} /> : 'Buy Land'}
                                </Button>
                            )}
                        </Box>
                    </>
                )}
            </Box>
            {showChart && (
                <Chart
                    data={[
                        { ...mintData, price: Number(mintData.priceStr) },
                        ...purchases.map(p => ({ ...p, price: Number(p.priceStr) })),
                    ]}
                    onClose={() => {
                        setShowChart(false)
                    }}
                />
            )}

            {showChangePriceModal && (
                <ChangePriceModal
                    mergeId={data.id}
                    currentPrice={price}
                    onClose={() => {
                        setShowChangePriceModal(false)
                    }}
                />
            )}

            {showWebsiteDialog && (
                <OpenExternalWebsiteDialog
                    externalLink={data.externalLink}
                    onClose={() => {
                        setShowWebsiteDialog(false)
                    }}
                />
            )}
        </Box>
    )
}

export default Entity
