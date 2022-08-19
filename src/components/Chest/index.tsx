import React, { FC } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { Box, Button } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { mint } from '../../contract-clients/chestContract.client'
import { useRequest } from 'ahooks'
import ChestIcon from '../../assets/Chest.png'
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
					<Box>
						<img src={ChestIcon} />

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
				<DialogContent>
					<Box>
						<img src={ChestIcon} />

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
								claimChest()
							}}
						>
							Navigate
						</Button>
					</Box>
				</DialogContent>
			</Dialog>
		)
	return finalDialog
}

export default Chest
