import React, { FC, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Box, Button, DialogTitle, IconButton, OutlinedInput, SvgIcon, Typography } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import { ReactComponent as NearPrice } from '../../assets/near-price.svg'
import { ReactComponent as CloseIcon } from '../../assets/close-button.svg'
import useNftContract from '../../hooks/useNftContract'
import useNearWallet from '../../adapters/near-wallet/useNearWallet'
import useMarketContract from '../../hooks/useMarketContract'
import { getDisplayPrice, toYoktoNear } from '../../utils'
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

type ChangePriceProps = {
  mergeId: string | null
  currentPrice: number | null | undefined
  currentPriceStr: string | null | undefined
  onClose: () => void
}

const ChangePriceModal: FC<ChangePriceProps> = ({ mergeId, currentPrice, currentPriceStr, onClose, ...rest }) => {
  const classes = useStyle()
  const [newPrice, setNewPrice] = useState<string>('')
  const { wallet } = useNearWallet()
  const { setForSale } = useNftContract(wallet)
  const { updatePrice } = useMarketContract(wallet)

  const handleInputChange = ({ target }) => {
    setNewPrice(target.value)
  }

  const handleUpdatePrice = async () => {
    if (!mergeId) {
      return
    }

    if (!currentPrice) {
      await setForSale(mergeId, toYoktoNear(parseFloat(newPrice)))
    } else {
      await updatePrice(mergeId, toYoktoNear(parseFloat(newPrice)))
    }
  }
  return (
    <Dialog open onClose={onClose} {...rest}>
      <DialogTitle>
        <Box display="flex" alignItems="start">
          <Box flexGrow={1} />
          {/* <IconButton aria-label="close change price modal" component="span" onClick={onClose}> */}
          <Box onClick={onClose} sx={{ cursor: 'pointer' }}>
            <SvgIcon component={CloseIcon} viewBox="0 0 24 24" sx={{ flexShrink: 0 }} />
          </Box>
          {/* </IconButton> */}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box className={classes.content} sx={{ justifyContent: 'center', alignItems: 'center' }}>
          <Box
            className={classes.container}
            sx={{
              mb: 2.25,
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0, 0.05)',
              width: '150px',
              height: '150px',
            }}
          >
            <SvgIcon component={NearPrice} viewBox="0 0 32 32" sx={{ flexShrink: 0 }} />
          </Box>
          <Box className={classes.container} sx={{ mb: 1 }}>
            <Typography fontWeight={600} fontSize={22}>
              Set Price
            </Typography>
          </Box>

          {currentPrice ? (
            <Box className={classes.container} sx={{ mb: 4.5 }}>
              <Typography fontSize={14} sx={{ mr: 1 }}>
                Current price is
              </Typography>
              <Typography fontSize={14} fontWeight={600}>
                {getDisplayPrice(currentPrice)} {` NEAR`}
              </Typography>
            </Box>
          ) : (
            <Box className={classes.container} sx={{ mb: 4.5 }}>
              <Typography fontSize={14}>No price has been set</Typography>
            </Box>
          )}

          <Box className={classes.container} sx={{ mb: 2.25 }}>
            <OutlinedInput
              placeholder="New Price"
              sx={{ width: 315, backgroundColor: 'rgba(0, 0, 0, 0.03)' }}
              value={newPrice}
              onChange={handleInputChange}
            />
          </Box>

          <Button
            sx={{ mb: 2, width: 315 }}
            variant="outlined"
            fullWidth
            size="large"
            color="info"
            onClick={() => {
              // setShowHistory(true)
            }}
          >
            Trading History
          </Button>
          <Button sx={{ mb: 2, width: 315 }} variant="contained" fullWidth size="large" color="primary" onClick={handleUpdatePrice}>
            Update Price
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ChangePriceModal
