import React, { FC } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Box, Button } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { mint } from '../../contract-clients/chestContract.client'
import { useRequest } from 'ahooks'
import useEvmProvider from '../../adaptors/evm-provider-adaptor/hooks/useEvmProvider'
import useEvmWallet from '../../adaptors/evm-wallet-adaptor/useEvmWallet'

type ChestProps = {
  chest: Chest | null
  distanceFromPlayer: number | null
  onClose: () => void
}

const useStyles = makeStyles({
  navigateDialog: {
    width: '90%',
    maxWidth: 440,
    minHeight: 512,
    borderRadius: 15,
  },
  claimDialog: {
    width: '90%',
    maxWidth: 340,
    minHeight: 380,
    borderRadius: 15,
  },
})

const Chest: FC<ChestProps> = ({ chest, distanceFromPlayer, onClose, ...rest }) => {
  const classes = useStyles()
  const { defaultProvider: provider, currentChain } = useEvmProvider()
  const { activeWalletAddress, signer } = useEvmWallet()

  const { run: claimChest } = useRequest<void, [void]>(
    () => mint(chest.id, activeWalletAddress, currentChain, signer),
    {
      manual: true,
    },
  )

  const finalDialog =
    distanceFromPlayer < 50 ? (
      <Dialog
        classes={{
          paper: classes.claimDialog,
        }}
        open
        onClose={onClose}
        {...rest}
      >
        <DialogContent>
          <Button
            sx={{ mb: 2 }}
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            onClick={() => {
              claimChest()
            }}
          >
            Open Chest
          </Button>
        </DialogContent>
      </Dialog>
    ) : (
      <Dialog
        classes={{
          paper: classes.navigateDialog,
        }}
        open
        onClose={onClose}
        {...rest}
      >
        <DialogContent>Salam</DialogContent>
      </Dialog>
    )
  return finalDialog
}

export default Chest
