import React, { FC } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'

type HistoryProps = {
  mergeId: number | string | null
  onClose: () => void
}
const History: FC<HistoryProps> = ({ mergeId, onClose, ...rest }) => {
  return (
    <Dialog open onClose={onClose} {...rest}>
      <DialogContent>
        <div>History</div>
      </DialogContent>
    </Dialog>
  )
}

export default History
