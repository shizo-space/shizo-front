import React, { FC } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Box, Button, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { mint } from '../../contract-clients/chestContract.client'
import { useRequest } from 'ahooks'
import ChestIcon from '../../assets/Chest.png'
import ChestOpenIcon from '../../assets/chest-open.png'
import useEvmProvider from '../../adaptors/evm-provider-adaptor/hooks/useEvmProvider'
import useEvmWallet from '../../adaptors/evm-wallet-adaptor/useEvmWallet'


const useStyles = makeStyles({
	navigateDialog: {
		width: '90%',
		maxWidth: 440,
		minHeight: 512,
		borderRadius: 15,
		padding: 16,
	},
	claimDialog: {
		width: '90%',
		maxWidth: 340,
		minHeight: 380,
		borderRadius: 15,
		padding: 16,
	},
})

type ChestProps = {
	chest: Chest | null
	distanceFromPlayer: number | null
	onClose: () => void
	onNavigate: (data) => void
}

const Chest: FC<ChestProps> = ({ chest, distanceFromPlayer, onClose, onNavigate, ...rest }) => {
	const classes = useStyles()
	const { defaultProvider: provider, currentChain } = useEvmProvider()
	const { activeWalletAddress, signer } = useEvmWallet()

	const { runAsync: claimChest } = useRequest<void, [void]>(
		() => mint(chest.id, activeWalletAddress, currentChain, signer),
		{
			manual: true,
		},
	)

	const handleClickClaimChest = async () => {
		await claimChest()
		onClose()
	}

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
				<DialogContent sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
					<Box>
						<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', mb: 12 }}>
							<img src={ChestOpenIcon} />
						</Box>

						<Button
							variant="contained"
							color="secondary"
							fullWidth
							size="large"
							onClick={() => {
								handleClickClaimChest()
							}}
						>
							Claim Rewards
						</Button>
					</Box>
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
				<DialogContent sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
						<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', mb: 15 }}>
							<img src={ChestIcon} />
						</Box>

						<Typography
							fontWeight={400}
							fontSize={16}
							align='center'
							sx={{mb: 5}}
						>
							You're not close enough to claim this chest
						</Typography>

						<Button
							sx={{
								background: "#8459FF",
								boxShadow: "0px 5px 15px rgba(132, 89, 255, 0.5), inset 0px -4px 0px 1px rgba(0, 0, 0, 0.1)",
								"&:hover": {
									background: "#6F3EAE",
									boxShadow: "0px 5px 15px rgba(132, 89, 255, 0.5), inset 0px -4px 0px 1px rgba(0, 0, 0, 0.1)",
								}
							}}
							variant="contained"
							fullWidth
							size="large"
							onClick={() => {
								onClose()
								onNavigate(chest)
							}}
						>
							Navigate
						</Button>
				</DialogContent>
			</Dialog>
		)
	return finalDialog
}

export default Chest
