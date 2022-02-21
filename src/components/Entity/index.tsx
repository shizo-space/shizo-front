import React, { FC, useState } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ReactComponent as FocusOnMap } from '../../assets/FocusOnMap.svg'
import { ReactComponent as Share } from '../../assets/Share.svg'
import { ReactComponent as Visible } from '../../assets/Visible.svg'
import { ReactComponent as User } from '../../assets/User.svg'
import { ReactComponent as Note } from '../../assets/Note.svg'
import { ReactComponent as Near } from '../../assets/near.svg'
import useGetOwnerName from '../../hooks/useGetOwnerName'
import useGetPrice from '../../hooks/useGetPrice'
import History from '../History'
import useNearWallet from '../../adapters/near-wallet/useNearWallet'
import useNftContract from '../../hooks/useNftContract'
import useMarketContract from '../../hooks/useMarketContract'
import ChangePriceModal from '../ChangePriceModal'
import { getDisplayPrice } from '../../utils'
import OpenExternalWebsiteDialog from '../OpenExternalWebsiteDialog'

const useStyle = makeStyles({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 375,
    height: '100vh',
    paddingTop: 128,
    backgroundColor: '#FFF',
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
})

type EntityProps = {
  data: any
  loading: boolean
  onFocus: (data) => void
  onEdit: (data) => void
}
const Entity: FC<EntityProps> = ({ data, loading, onFocus, onEdit }) => {
  const classes = useStyle()
  const [showTooltip, setShowTooltip] = useState<boolean>(false)
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [showWebsiteDialog, setShowWebsiteDialog] = useState<boolean>(false)
  const [showChangePriceModal, setShowChangePriceModal] = useState<boolean>(false)
  const { name: ownerName, loading: ownerNameLoading } = useGetOwnerName(data?.id)
  const { price, loading: priceLoading, priceStr } = useGetPrice(data?.id)
  const { accountId, wallet, isSignedIn, signIn } = useNearWallet()
  const { mintNft } = useNftContract(wallet)
  const { buy } = useMarketContract(wallet)

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
    if (!priceStr) {
      return
    }

    await buy(data.id, priceStr)
  }

  const isOwnerOfEntity = ownerName && ownerName === accountId

  return (
    <Box className={classes.root}>
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
                      {data.name && data.name.length > 0 ? data.name : 'Unnamed'}
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
                  <CopyToClipboard text={`${window.location.host}/map/${data.id}`} onCopy={handleOpenTooltip}>
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
                        <SvgIcon component={Share} viewBox="0 0 24 24" />
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
                <SvgIcon component={User} viewBox="0 0 24 24" sx={{ mr: 1.25, flexShrink: 0, mt: -0.5 }} title="Owner Name" />
                <Box>
                  <Box sx={{ mb: 1.25 }}>
                    <Typography fontWeight={400} fontSize={14} lineHeight="18px" color={'#505050'}>
                      Owner
                    </Typography>
                  </Box>
                  {ownerNameLoading ? (
                    <Skeleton width={100} height={18} />
                  ) : (
                    <Typography fontWeight={700} fontSize={18} lineHeight="16px">
                      {ownerName && ownerName.length > 0 ? ownerName : 'This selection has no owner'}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3.5 }}>
                <SvgIcon component={Note} viewBox="0 0 24 24" sx={{ mr: 1.25, flexShrink: 0, mt: -0.5 }} title="Description" />
                <Box>
                  <Box sx={{ mb: 1.25 }}>
                    <Typography fontWeight={400} fontSize={14} lineHeight="18px" color={'#505050'}>
                      Description
                    </Typography>
                  </Box>
                  <Typography fontWeight={400} fontSize={12} lineHeight="20px">
                    {data.description && data.description.length > 0 ? data.description : 'This selection has no description'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              {priceLoading ? (
                <Box className={classes.container} sx={{ mb: 2.25 }}>
                  <Skeleton width={104} height={18} />
                </Box>
              ) : ownerName && ownerName !== accountId && !price ? null : (
                <Box className={classes.container} sx={{ mb: 2.25, width: 1, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SvgIcon component={Near} viewBox="0 0 24 24" sx={{ mr: 1.25, flexShrink: 0, mt: -0.5 }} />
                    <Typography fontWeight={700} fontSize={18} lineHeight="16px">
                      {isOwnerOfEntity && !price ? '--' : price ? getDisplayPrice(price) : 10}
                      {` NEAR`}
                    </Typography>
                  </Box>
                  {isOwnerOfEntity && (
                    <Button
                      variant="text"
                      sx={{ fontWeight: 500, fontSize: 16, lineHeight: '14px' }}
                      onClick={() => {
                        setShowChangePriceModal(true)
                      }}
                    >
                      {!price ? '(Set Price)' : '(Change Price)'}
                    </Button>
                  )}
                </Box>
              )}

              {/* <Button
                sx={{ mb: 2 }}
                variant="outlined"
                fullWidth
                size="large"
                color="info"
                onClick={() => {
                  setShowHistory(true)
                }}
              >
                Trading History
              </Button> */}
              {data.externalLink && (
                <Button
                  sx={{ mb: 2 }}
                  variant="contained"
                  fullWidth
                  size="large"
                  color="secondary"
                  onClick={() => {
                    setShowWebsiteDialog(true)
                  }}
                >
                  Visit Website
                </Button>
              )}

              {isOwnerOfEntity ? (
                <Button
                  disabled={ownerNameLoading}
                  sx={{ mb: 2 }}
                  variant="contained"
                  fullWidth
                  size="large"
                  color="success"
                  onClick={() => {
                    onEdit(data)
                  }}
                >
                  Edit Land
                </Button>
              ) : ownerName && !price ? (
                <Button
                  disabled={true}
                  sx={{ mb: 2, height: '41px', fontSize: '14px' }}
                  variant="contained"
                  fullWidth
                  size="large"
                  color="warning"
                >
                  This land is not available for sale
                </Button>
              ) : (
                <Button
                  disabled={ownerNameLoading}
                  sx={{ mb: 2 }}
                  variant="contained"
                  fullWidth
                  size="large"
                  color="primary"
                  onClick={() => {
                    ownerName ? handleBuy() : handleMint()
                  }}
                >
                  Buy Land
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
      {showHistory && (
        <History
          mergeId={data.id}
          onClose={() => {
            setShowHistory(false)
          }}
        />
      )}
      {showChangePriceModal && (
        <ChangePriceModal
          mergeId={data.id}
          currentPrice={price}
          currentPriceStr={priceStr}
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
