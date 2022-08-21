import { Button, Dialog, DialogContent, SvgIcon, Typography } from "@mui/material"
import { makeStyles } from "@mui/styles"
import { Box } from "@mui/system"
import useEvmProvider from "../../adaptors/evm-provider-adaptor/hooks/useEvmProvider"
import useEvmWallet from "../../adaptors/evm-wallet-adaptor/useEvmWallet"
import { ReactComponent as ArrowIcon } from '../../assets/arrow.svg'
import { ReactComponent as TeleportIcon } from '../../assets/teleport-icon-2.svg'
import { ReactComponent as ShenIcon } from '../../assets/shen-icon.svg'
import { useRequest } from "ahooks"
import { upgrade } from "../../contract-clients/shizoContract.client"
import { allowance, approve } from "../../contract-clients/shenContract.client"
import { BigNumber } from "ethers"
import { ShenRequiredForUpgrade } from "../../constants"


const useStyles = makeStyles({
	dialog: {
		width: '90%',
		maxWidth: 450,
		minHeight: 400,
		borderRadius: 15,
		paddingTop: 16,
		paddingLeft: 42, 
		paddingRight: 42,
	}
})

type UpgradeProps = {
	level: number
	tokenId: number | string
	onClose: () => void
}

const shenRequiredForUpgrade = [0, 25, 50, 100, 250, 500]


const MAX_ALLOWANCE_AMOUNT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

const UpgradeDialog = ({ level, onClose, tokenId }) => {
	const classes = useStyles()
	const { defaultProvider: provider, currentChain } = useEvmProvider()
	const { activeWalletAddress, signer } = useEvmWallet()

	const { runAsync: upgradeLand } = useRequest<void, [string, number]>(
		(tokenId, level) => upgrade(tokenId, level, currentChain, signer),
		{
			manual: true
		}
	)

    async function checkAllowanceAndApprove() {
        const allowanceAmount = await allowance(activeWalletAddress, currentChain, provider)
        if (allowanceAmount.toHexString() !== MAX_ALLOWANCE_AMOUNT) {
            await approve(BigNumber.from(MAX_ALLOWANCE_AMOUNT), currentChain, signer)
        }
    }

	const handleOnUpgradeClick = async () => {
		await checkAllowanceAndApprove()
		await upgradeLand(tokenId, level);
	}

	return <Dialog
		classes={{ paper: classes.dialog }}
		open
		onClose={onClose}
	>
		<DialogContent>
			<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
				<Typography
					fontWeight={500}
					fontSize={25}>
					Upgrade
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', mb: 5 }}>
				<Box sx={{
					width: '100px', height: '30px', backgroundColor: '#808080', borderRadius: 39,
					display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', mr: 4,
					paddingTop: 0.5
				}}>
					<Typography
						fontWeight={500}
						fontSize={14}
						color="#FFFFFF">
						LEVEL {level}
					</Typography>

				</Box>

				<SvgIcon component={ArrowIcon} viewBox="0 0 48 48" sx={{ width: '48px', height: '48px', mr: 4 }} />
				<Box sx={{
					width: '100px', height: '30px', backgroundColor: '#2D9AFF', borderRadius: 39,
					display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
					paddingTop: 0.5
				}}>
					<Typography
						fontWeight={500}
						fontSize={14}
						color="#FFFFFF">
						LEVEL {level + 1}
					</Typography>

				</Box>
			</Box>
			<Box sx={{ mb: 1 }}>
				<Typography
					fontWeight={500}
					fontSize={14}>
					Changes
				</Typography>
			</Box>
			<Box sx={{ mb: 6 }}>
				<Box sx={{
					width: '100px', height: '30px', background: 'rgba(132, 89, 255, 0.1)', borderRadius: 39,
					display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
					paddingTop: 0.5
				}}>
					<SvgIcon component={TeleportIcon} />
					<Typography
						fontWeight={500}
						fontSize={16}
						color="#8459FF">
						-15 min
					</Typography>

				</Box>
			</Box>
									<Button
										variant='contained'
										color="secondary"
										fullWidth
										size='large'
										style={{
											fontWeight: 700,
										}}
										onClick={() => {
											handleOnUpgradeClick()
										}}
									>
											Upgrade (
											<SvgIcon component={ShenIcon} sx={{ mb: 0.75, mr: 0.75 }} />
				{shenRequiredForUpgrade[level]})
									</Button>
		</DialogContent>

	</Dialog>
}

export default UpgradeDialog
