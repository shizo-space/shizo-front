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
import { ReactComponent as Visible } from '../../assets/views-dark.svg'
import { ReactComponent as User } from '../../assets/owner-dark.svg'
import { ReactComponent as Note } from '../../assets/note-dark.svg'
import { ReactComponent as Tfuel } from '../../assets/tfuel.svg'
import { ReactComponent as TeleportIcon } from '../../assets/teleport.svg'
import { ReactComponent as NavigationIcon } from '../../assets/Navigation.svg'
import { ReactComponent as PolygonIcon } from '../../assets/polygon.svg'
import { ReactComponent as CloseIcon } from '../../assets/close-button.svg'
import { ReactComponent as TaxiIcon } from '../../assets/Taxi.svg'

import ChangePriceModal from '../ChangePriceModal'
import OpenExternalWebsiteDialog from '../OpenExternalWebsiteDialog'
import { directionApi } from '../../utils/request'
import { Paper } from '@mui/material'

import useEvmWallet from '../../adaptors/evm-wallet-adaptor/useEvmWallet'
import {
  mint,
  getOwnerOf,
  getMarketDetails,
  purchase,
  teleport,
  startTransit,
  cancelTransit,
  finishTransit,
} from '../../contract-clients/shizoContract.client'
import { useRequest } from 'ahooks'
import useEvmProvider from '../../adaptors/evm-provider-adaptor/hooks/useEvmProvider'
import { shortenAddress } from '../../utils'
import { baseConfig } from '../../configs'
import { BigNumber, ethers } from 'ethers'
import useNewBlock from '../../adaptors/evm-provider-adaptor/hooks/useNewBlock'
// import { getMint, getPurchases } from '../../gql'
import Chart from '../Chart'
import axios from 'axios'
import { parse } from 'path'
import Chest from '../Chest'
import { approve } from '../../contract-clients/shenContract.client'

const useStyle = makeStyles((theme: any) => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 375,
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
    padding: 30,
  },
  loading: {
    alignSelf: 'center',
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
  userPosition: any
  onFocus: (data) => void
  onEdit: (data) => void
  onRoute: (polyline) => void
}

const Entity: FC<EntityProps> = ({ data, loading, userPosition, onFocus, onEdit, onRoute }) => {
  const classes = useStyle()

  const { defaultPrice } = baseConfig
  const [showTooltip, setShowTooltip] = useState<boolean>(false)
  const [showChart, setShowChart] = useState<boolean>(false)
  const [showWebsiteDialog, setShowWebsiteDialog] = useState<boolean>(false)
  const [showChangePriceModal, setShowChangePriceModal] = useState<boolean>(false)
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null)
  const [originalPrice, setOriginalPrice] = useState<BigNumber | null>(null)
  const [steps, setSteps] = useState<any>(null)
  const [purchases, setPurchases] = useState(null)
  const [mintData, setMintData] = useState(null)
  const [price, setPrice] = useState<string | null>(defaultPrice)
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

  const { run: buy } = useRequest<void, [string]>(
    mergeId => purchase(mergeId, originalPrice, currentChain, signer),
    {
      manual: true,
    },
  )

  const { runAsync: transitBegin } = useRequest<void, [number]>(
    transitType => startTransit(transitType, steps, currentChain, signer),
    {
      manual: true,
    },
  )

  const { runAsync: cancelActiveTransit } = useRequest<void, [void]>(
    () => cancelTransit(currentChain, signer),
    {
      manual: true,
    },
  )

  const { runAsync: finishActiveTransit } = useRequest<void, [void]>(() => approveAndFinishTransit(), {
    manual: true,
  })

  const { run: teleportToLand } = useRequest<void, [string]>(
    mergeId => teleport(mergeId, currentChain, signer),
    {
      manual: true,
    },
  )

  async function approveAndFinishTransit() {
    await approve(ethers.utils.parseEther('1000'), currentChain, signer)
    await finishTransit(currentChain, signer)
  }

  async function navigate() {
    if (!data) {
      console.error('entity is undefined')
      return
    }
    console.log('HERE')
    const res = await directionApi.get('/routes', {
      params: {
        srcLat: userPosition.lat,
        srcLong: userPosition.lon,
        dstLat: data.lat,
        dstLong: data.lon,
        vehicle: 'car',
        searchMethod: 'fastest',
        walletAddress: activeWalletAddress,
      },
    })
    console.log(res)
    onRoute(res?.data?.polyline_path)
    setSteps(res?.data?.route?.steps)
  }

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

  const { loading: marketDetailsLoading } = useRequest<any, [string]>(
    () => getMarketDetails(data?.id, currentChain, provider),
    {
      onSuccess: marketDetails => {
        if (marketDetails?.listing) {
          setForSale(true)
          setPrice(ethers.utils.formatEther(marketDetails.price))
          setOriginalPrice(marketDetails.price)
        } else {
          setPrice(defaultPrice)
          setOriginalPrice(null)
        }
      },
      onError: err => {
        console.error(err)
        setPrice(defaultPrice)
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

  const handleMint = async () => {
    await mintNft(data.id)
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
            <Box className={classes.top}>
              <Box className={classes.topInfo}>
                <Box className={classes.nameSegment}>
                  <Box sx={{ mb: 1.25 }}>
                    <Typography fontWeight={800} lineHeight="25px" fontSize={25}>
                      {data.name?.length > 0 ? data.name : 'Unnamed'}
                    </Typography>
                  </Box>
                  {data.osmName && (
                    <Typography fontWeight={400} lineHeight="14px" fontSize={14}>
                      ({data.osmName})
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Box sx={{ mb: 1.25 }}>
                    <IconButton size="medium" onClick={() => onFocus(data)}>
                      <SvgIcon component={FocusOnMap} viewBox="0 0 24 24" color="primary" />
                    </IconButton>
                  </Box>
                  <CopyToClipboard text={`${window.location.host}/${data.id}`} onCopy={handleOpenTooltip}>
                    <Tooltip
                      title="Copied!"
                      placement="top"
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      onClose={handleCloseTooltip}
                      open={showTooltip}
                    >
                      <IconButton size="medium">
                        <SvgIcon component={Share} sx={{ color: 'transparent' }} viewBox="0 0 24 24" />
                      </IconButton>
                    </Tooltip>
                  </CopyToClipboard>
                </Box>
              </Box>
              <Box sx={{ mb: 4 }} className={classes.container}>
                <SvgIcon component={Visible} viewBox="0 0 24 24" sx={{ mr: 1.25 }} title="Number of Views" />
                <Typography fontWeight={700} fontSize={18} lineHeight="16px">
                  {data.numberOfViews}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3.5 }}>
                <SvgIcon
                  component={User}
                  viewBox="0 0 24 24"
                  sx={{ mr: 1.25, flexShrink: 0, mt: -0.5 }}
                  title="Owner Name"
                />
                <Box>
                  <Box sx={{ mb: 1.25 }}>
                    <Typography fontWeight={400} fontSize={14} lineHeight="18px" color={'#949494'}>
                      Owner
                    </Typography>
                  </Box>
                  {ownerAddressLoading ? (
                    <Skeleton width={100} height={18} />
                  ) : (
                    <Typography fontWeight={700} fontSize={18} lineHeight="16px">
                      {ownerAddress?.length > 0
                        ? shortenAddress(ownerAddress, 18, 4)
                        : 'This selection has no owner'}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3.5 }}>
                <SvgIcon
                  component={Note}
                  viewBox="0 0 24 24"
                  sx={{ mr: 1.25, flexShrink: 0, mt: -0.5 }}
                  title="Description"
                />
                <Box>
                  <Box sx={{ mb: 1.25 }}>
                    <Typography fontWeight={400} fontSize={14} lineHeight="18px" color={'#949494'}>
                      Description
                    </Typography>
                  </Box>
                  <Typography fontWeight={400} fontSize={12} lineHeight="20px">
                    {data.description?.length > 0 ? data.description : 'This selection has no description'}
                  </Typography>
                </Box>
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
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SvgIcon
                      component={Tfuel}
                      viewBox="0 0 24 24"
                      sx={{ mr: 1.25, flexShrink: 0, mt: -0.5 }}
                    />
                    <Typography fontWeight={700} fontSize={18} lineHeight="16px">
                      {isOwnerOfEntity && !forSale ? '--' : forSale ? price : `${defaultPrice}`}
                      {` ${currentChain.baseToken.symbol}`}
                    </Typography>
                  </Box>
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
                    <CustomIconButton size="medium" onClick={() => teleportToLand(data.id)} color="secondary">
                      <SvgIcon component={TeleportIcon} viewBox="0 0 24 24" />
                    </CustomIconButton>
                  )}
                  <CustomIconButton size="medium" onClick={() => navigate()} color="secondary">
                    <SvgIcon component={NavigationIcon} viewBox="0 0 24 24" />
                  </CustomIconButton>
                  <CustomIconButton size="medium" onClick={() => transitBegin(0)} color="secondary">
                    <SvgIcon component={PolygonIcon} viewBox="0 0 24 24" />
                  </CustomIconButton>
                  <CustomIconButton size="medium" onClick={() => cancelActiveTransit()} color="secondary">
                    <SvgIcon component={CloseIcon} viewBox="0 0 18 18" />
                  </CustomIconButton>
                  <CustomIconButton size="medium" onClick={() => finishActiveTransit()} color="secondary">
                    <SvgIcon component={TaxiIcon} viewBox="0 0 24 24" />
                  </CustomIconButton>
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
                  sx={{ mb: 2, backgroundColor: '#0084FF', ':hover': { backgroundColor: '#0084FF' } }}
                  variant="contained"
                  fullWidth
                  size="large"
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
                  variant="contained"
                  fullWidth
                  size="large"
                  style={{
                    background: 'linear-gradient(243.83deg, #5EBEDD 25.02%, #6BDCC6 62.79%)',
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
                  variant="contained"
                  fullWidth
                  style={{ background: 'rgba(242, 88, 34, 0.3)', color: 'rgba(242, 88, 34, 1)' }}
                  size="large"
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
                  variant="contained"
                  fullWidth
                  size="large"
                  style={{
                    background: 'linear-gradient(243.83deg, #5EBEDD 25.02%, #6BDCC6 62.79%)',
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
