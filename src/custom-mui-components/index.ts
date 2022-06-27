import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'

export const CustomIconButton = styled(IconButton)(({ theme, color }) => ({
  backgroundColor: theme.palette[color].main,
  '&:hover': {
    backgroundColor: theme.palette[color].dark,
  },
}))
