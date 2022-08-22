import React, { FC, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import makeStyles from '@mui/styles/makeStyles'
import { useHistory } from 'react-router-dom'
import { ReactComponent as User } from '../../assets/UserOutlined.svg'
import { ReactComponent as Polygon } from '../../assets/polygon.svg'
import { ReactComponent as MyProperties } from '../../assets/MyProperties.svg'
import SvgIcon from '@mui/material/SvgIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import ListItemIcon from '@mui/material/ListItemIcon'
import useEvmWallet from '../../adaptors/evm-wallet-adaptor/useEvmWallet'
import useTokenBalance from '../../adaptors/evm-provider-adaptor/hooks/useTokenBalance'
import useEvmProvider from '../../adaptors/evm-provider-adaptor/hooks/useEvmProvider'
import { shortenAddress } from '../../utils'
import { Avatar } from '@mui/material'

const useStyle = makeStyles({
	root: {
		position: 'fixed',
		top: 0,
		right: 0,
		width: 260,
		height: 158,
		padding: 15,
		zIndex: 2,
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		borderTopRightRadius: 0,
		borderTopLeftRadius: 0,
		boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1), inset 0px -3px 0px rgba(0, 0, 0, 0.1)',
		userSelect: 'none',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
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

const Dashboard: FC = ({ }) => {
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
				{isWalletConnectedToSite ?
					<Box sx={{
						display: 'flex',
						flexDirection: 'row',
						justiyContent: 'center',
						alignItems: 'center'
					}}>
						<Avatar sx={{ margin: 0.5, width: 50, height: 50 }} src="https://shizo.space/static/icons/Avatar3.png" />
						<Typography fontWeight={700} fontSize={20} sx={{ margin: 0.5 }}>
							{shortenAddress(activeWalletAddress)}
						</Typography>
					</Box>
					:
					<Button
						fullWidth
						color="secondary"
						variant="contained"
						sx={{
							fontWeight: 500,
							fontSize: 22,
							height: 54,
							marginBottom: 1,
						}}
						onClick={() => {
							if (!isWalletConnectedToSite) {
								connectWallet()
							}
						}}
					// disabled={isWalletConnectedToSite}
					>
						Connect Wallet
					</Button>
				}

				<Button
					fullWidth
					sx={{
						fontWeight: 500,
						fontSize: 22,
						borderRadius: 4,
						height: 54,
						marginTop: 1,
						borderColor: "#EEEEEE"
					}}
					disabled={true}
					variant="outlined">
					<Box
						sx={{
							width: 1,
							display: "flex",
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center"
						}}>
						<Box
							sx={{ marginX: 0.5 }}
						>
							<SvgIcon component={Polygon} inheritViewBox />
						</Box>
						<Box
							sx={{
								marginX: 0.5,
								color: '#000000'
							}}>
							Polygon
						</Box>
					</Box>


				</Button>

				{/* {activeWalletAddress && ( */}
				{/* 	<Box sx={{ borderRadius: '20px', cursor: 'pointer', ml: '5px' }} onClick={handleClickUser}> */}
				{/* 		<Avatar */}
				{/* 			size={40} */}
				{/* 			name={activeWalletAddress} */}
				{/* 			variant="beam" */}
				{/* 			colors={['#6BDCC6', '#5EBEDD', '#265B75', '#0C8F8F', '#0B1216']} */}
				{/* 		/> */}
				{/* 	</Box> */}
				{/* )} */}
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
