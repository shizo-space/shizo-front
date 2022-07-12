import React, { FC, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Box, Button, DialogTitle, OutlinedInput, SvgIcon, Typography } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'
import { ReactComponent as Logo } from '../../assets/theta-logo-big.svg'
import { ReactComponent as CloseIcon } from '../../assets/close-dark.svg'
import useEvmProvider from '../../adaptors/evm-provider-adaptor/hooks/useEvmProvider'
import { useRequest } from 'ahooks'
import { setPrice } from '../../contract-clients/shizoContract.client'
import useEvmWallet from '../../adaptors/evm-wallet-adaptor/useEvmWallet'
import { BigNumber, ethers } from 'ethers'
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
  currentPrice: BigNumber | null
  onClose: () => void
}

const ChangePriceModal: FC<ChangePriceProps> = ({ mergeId, currentPrice, onClose, ...rest }) => {
  const classes = useStyle()
  const [newPrice, setNewPrice] = useState<string>(ethers.utils.formatEther(currentPrice))
  const { currentChain } = useEvmProvider()
  const { signer } = useEvmWallet()

  const { runAsync: changePrice } = useRequest<void, [string]>(
    newPrice => setPrice(mergeId, newPrice, currentChain, signer),
    {
      manual: true,
    },
  )

  const handleInputChange = ({ target }) => {
    setNewPrice(target.value)
  }

  const handleUpdatePrice = async () => {
    if (!mergeId) {
      return
    }

    await changePrice(newPrice)
    onClose()
  }

  return (
    <Dialog open onClose={onClose} {...rest}>
      <DialogTitle sx={{ backgroundColor: '#0B1216' }}>
        <Box display="flex" alignItems="start">
          <Box flexGrow={1} />
          {/* <IconButton aria-label="close change price modal" component="span" onClick={onClose}> */}
          <Box onClick={onClose} sx={{ cursor: 'pointer' }}>
            <SvgIcon component={CloseIcon} viewBox="0 0 24 24" sx={{ flexShrink: 0 }} />
          </Box>
          {/* </IconButton> */}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: '#0B1216' }}>
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
            <SvgIcon component={Logo} viewBox="0 0 100 100" />
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
                {`${ethers.utils.formatEther(currentPrice)} ${currentChain?.baseToken?.symbol}`}
              </Typography>
            </Box>
          ) : (
            <Box className={classes.container} sx={{ mb: 4.5 }}>
              <Typography fontSize={14}>No price has been set</Typography>
            </Box>
          )}

          <Box className={classes.container} sx={{ mb: 4.25 }}>
            <OutlinedInput
              placeholder="New Price"
              sx={{
                width: 315,
                background:
                  'linear-gradient(243.83deg, rgba(94, 190, 221, 0.2) 25.02%, rgba(107, 220, 198, 0.2) 62.79%)',
              }}
              value={newPrice}
              onChange={handleInputChange}
            />
          </Box>

          {/* <Button
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
          </Button> */}
          <Button
            sx={{
              mb: 2,
              width: 315,
              background:
                'linear-gradient(243.83deg, rgba(94, 190, 221, 1) 25.02%, rgba(107, 220, 198, 1) 62.79%)',
              fontWeight: 700,
            }}
            variant="contained"
            fullWidth
            size="large"
            onClick={handleUpdatePrice}
          >
            Update Price
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ChangePriceModal
