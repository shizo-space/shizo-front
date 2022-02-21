import React, { FC, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import makeStyles from '@mui/styles/makeStyles'
import { useHistory } from 'react-router-dom'
import { ReactComponent as User } from '../../assets/UserOutlined.svg'
import { ReactComponent as LogOut } from '../../assets/LogOut.svg'
import { ReactComponent as MyProperties } from '../../assets/MyProperties.svg'
import SvgIcon from '@mui/material/SvgIcon'
import useNearWallet from '../../adapters/near-wallet/useNearWallet'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import ListItemIcon from '@mui/material/ListItemIcon'

const useStyle = makeStyles({
  root: {
    position: 'fixed',
    top: 25,
    right: 25,
    height: 50,
    padding: 5,
    zIndex: 2,
    backgroundColor: '#FFF',
    borderRadius: 25,
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.12)',
    userSelect: 'none',
  },
  menuPaper: {
    minWidth: 250,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
    borderRadius: 24,
    padding: '4px 0',
  },
  menu: {
    '& .MuiBackdrop-root': {
      backdropFilter: 'blur(0)',
      backgroundColor: 'transparent !important',
    },
  },
  menuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
  },
})

const Dashboard: FC = ({}) => {
  const classes = useStyle()
  const history = useHistory()
  const { signIn, wallet, isSignedIn, signOut, accountId } = useNearWallet()
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)

  const handleClickUser = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Box className={classes.root}>
        <Button
          sx={{
            height: 40,
            borderRadius: '20px',
            px: 2.5,
            backgroundColor: '#000',
            color: '#FFF',
            mr: '5px',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
            '&:disabled': {
              backgroundColor: '#000',
              color: '#FFF',
            },
          }}
          onClick={() => {
            if (!isSignedIn) {
              signIn()
            }
          }}
          variant="contained"
          disabled={isSignedIn}
        >
          {isSignedIn ? accountId : 'Connect to NEAR (Testnet)'}
        </Button>
        <IconButton
          sx={{
            width: 40,
            height: 40,
            backgroundColor: '#FFF',
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.06)',
            border: '0.5px solid #EEE',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
          }}
          onClick={handleClickUser}
          disabled={!isSignedIn}
        >
          <SvgIcon component={User} sx={{ color: 'transparent' }} />
        </IconButton>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        transformOrigin={{
          vertical: -10,
          horizontal: 'left',
        }}
        classes={{ root: classes.menu, paper: classes.menuPaper }}
      >
        <MenuItem
          className={classes.menuItem}
          onClick={() => {
            history.push('/my-properties')
          }}
        >
          <ListItemIcon>
            <SvgIcon component={MyProperties} sx={{ color: 'transparent' }} />
          </ListItemIcon>
          <Typography>My Properties</Typography>
        </MenuItem>

        <MenuItem
          className={classes.menuItem}
          onClick={() => {
            signOut()
          }}
        >
          <ListItemIcon>
            <SvgIcon component={LogOut} sx={{ color: 'transparent' }} />
          </ListItemIcon>
          <Typography>Log Out</Typography>
        </MenuItem>
      </Menu>
    </>
  )
}

export default Dashboard
