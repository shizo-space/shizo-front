import React, { FC, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import makeStyles from '@mui/styles/makeStyles'
import { useHistory } from 'react-router-dom'
import { ReactComponent as User } from '../../assets/UserOutlined.svg'
import { ReactComponent as MyProperties } from '../../assets/MyProperties.svg'
import SvgIcon from '@mui/material/SvgIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import ListItemIcon from '@mui/material/ListItemIcon'
import useEvmWallet from '../../adaptors/evm-wallet-adaptor/useEvmWallet'
import useTokenBalance from '../../adaptors/evm-provider-adaptor/hooks/useTokenBalance'
import useEvmProvider from '../../adaptors/evm-provider-adaptor/hooks/useEvmProvider'
import Avatar from 'boring-avatars'
import { shortenAddress } from '../../utils'

const useStyle = makeStyles({
  root: {
    position: 'fixed',
    top: 25,
    right: 25,
    height: 50,
    padding: 5,
    zIndex: 2,
    backgroundColor: '#0B1216',
    borderRadius: 10,
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.12)',
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'row',
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
  const { currentChain } = useEvmProvider()
  const { connectWallet, isWalletConnectedToSite, activeWalletAddress } = useEvmWallet()
  const { loading: tokenBalanceLoading, displayAmount } = useTokenBalance(currentChain.baseToken)
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)

  const handleClickUser = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const renderDashboardContent = () => {
    let walletAddress = null
    if (isWalletConnectedToSite && activeWalletAddress) {
      walletAddress = shortenAddress(activeWalletAddress)
    }

    let balanceText = null
    if (!tokenBalanceLoading && displayAmount) {
      balanceText = `${displayAmount} ${currentChain?.baseToken?.symbol}`
    }

    if (!walletAddress && !balanceText) {
      return 'Connect'
    }

    if (walletAddress && !balanceText) {
      return walletAddress
    }

    return `${balanceText} | ${walletAddress}`
  }

  return (
    <>
      <Box className={classes.root}>
        <Button
          sx={{
            height: 40,
            borderRadius: '10px',
            px: 2.5,
            // color: '#FFF',
            color: '#000',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
            '&:disabled': {
              backgroundColor: 'linear-gradient(243.83deg, #5EBEDD 25.02%, #6BDCC6 62.79%)',
              color: '#000',
              opacity: 1,
            },
          }}
          style={{ background: 'linear-gradient(243.83deg, #5EBEDD 25.02%, #6BDCC6 62.79%)' }}
          onClick={() => {
            if (!isWalletConnectedToSite) {
              connectWallet()
            }
          }}
          variant="contained"
          disabled={isWalletConnectedToSite}
        >
          {renderDashboardContent()}
        </Button>

        {activeWalletAddress && (
          <Box sx={{ borderRadius: '20px', cursor: 'pointer', ml: '5px' }} onClick={handleClickUser}>
            <Avatar
              size={40}
              name={activeWalletAddress}
              variant="beam"
              colors={['#6BDCC6', '#5EBEDD', '#265B75', '#0C8F8F', '#0B1216']}
            />
          </Box>
        )}
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
      </Menu>
    </>
  )
}

export default Dashboard
