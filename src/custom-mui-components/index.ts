import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'

export const CustomIconButton = styled(IconButton)(({ theme, color }) => ({
	backgroundColor: theme.palette[color].main,
	'&:hover': {
		backgroundColor: theme.palette[color].dark,
	},
	'&:disabled': {
		backgroundColor: '#BDBDBD',
		boxShadow: '0px 5px 15px rgba(189, 189, 189, 0.5), inset 0px -4px 0px 1px rgba(0, 0, 0, 0.1)'
	}
}))
