import React, { FC } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Button, DialogActions, DialogContentText, DialogTitle } from '@mui/material'

type OpenExternalWebsiteProps = {
  onClose: () => void
  externalLink: string | undefined
}
const OpenExternalWebsiteDialog: FC<OpenExternalWebsiteProps> = ({ onClose, externalLink, ...rest }) => {
  return (
    <Dialog
      open
      onClose={onClose}
      PaperProps={{
        style: { maxWidth: 500, minHeight: 240 },
      }}
    >
      <DialogTitle>{''}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mt: 1 }}>
          You're about to visit an external website. Metagate can't be held responsible for any material
          contained on those external websites and Metagate don't accept any liability in connection with any
          information or services they provide.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button sx={{ color: '#6BDCC6' }} onClick={onClose}>
          Disagree
        </Button>
        <Button
          sx={{ color: '#6BDCC6' }}
          onClick={() => {
            onClose()
            window.open(externalLink, '_blank')?.focus()
          }}
          autoFocus
        >
          Agree
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default OpenExternalWebsiteDialog
