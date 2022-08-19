import React, { FC, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import styled from "@mui/system/styled";
import distance_png from '../../assets/Distance.png';
import walk_icon from '../../assets/walk-icon.png';
import taxi_icon from '../../assets/taxi-icon.png';
import bike_icon from '../../assets/bike-icon.png';
import blue_value_icon from '../../assets/blue_value.png';
import green_value_icon from '../../assets/green_value.png';
import orange_value_icon from '../../assets/orange_value.png';
import arrow_left from '../../assets/arrow-left-button.png';
import Button from '@mui/material/Button'
import { makeStyles } from '@mui/styles';
import ItemSummarySegment from '../ItemSummarySegment';


const useStyle = makeStyles((theme: any) => ({
	root: {
		position: 'fixed',
		top: 0,
		left: 0,
		width: 400,
		height: '100vh',
		paddingTop: 128,
		backgroundColor: theme?.palette?.mode === 'dark' ? 'rgba(11, 18, 22, 0.95)' : '#FFF',
		zIndex: 2,
		overflowX: 'hidden',
		overflowY: 'auto',
	},
	content: {
		width: '100%',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		padding: 20,
	},
	loading: {
		alignSelf: 'center',
	},
	itemSummary: {
		marginBottom: 30,
	},
	top: {
		flexGrow: 1,
		flexShrink: 0,
	},
	topInfo: {
		width: '100%',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
	},
	nameSegment: {
		flexGrow: 1,
	},
	container: {
		display: 'flex',
		alignItems: 'center',
	},
}))

const DistanceIcon = styled('img')({
	width: 38,
});

const RideOptionIcon = styled('img')({
	height: '100%',
});

const RideValueIcon = styled('img')({
	height: 25,
	width: 25,
	marginRight: 5,
});

const RideOptionValue: FC<{
	icon: string,
	value: number,
	label: string,
}> = ({ icon, value, label }) => {
	return (
		<Box>
			<Box sx={{
				width: '100%', height: 45, display: 'flex', alignItems: 'center',
				p: 1.25, backgroundColor: '#FFF'
			}} >
				<RideValueIcon src={icon} />
				<Box sx={{ display: 'flex', direction: 'column' }} >
					<Typography fontSize={20} fontWeight={500} lineHeight="15px">{value}</Typography>
					<Typography fontSize={10} fontWeight={400} lineHeight="12px">{label}</Typography>
				</Box>
			</Box>
		</Box>
	)
};
const RideOption: FC<{
	id: string | number,
	icon: string,
	blueValue: number,
	orangeValue: number,
	greenValue: number,
	selectedId: string | number,
	onSelect: (id: string | number) => void,
}> = ({
	id,
	icon,
	blueValue,
	orangeValue,
	greenValue,
	selectedId,
	onSelect,
}) => {
		const isActive = useMemo<boolean>(() => id === selectedId, [selectedId, id]);
		return (
			<Box sx={{
				width: 1, height: 140, p: 2.5, borderRadius: 5, mb: 2.5, display: 'flex', alignItems: 'stretch',
				background: isActive ? 'rgba(132, 89, 255, 0.05)' : '#FAFAFA',
				boxShadow: isActive ? '0px 5px 20px rgba(132, 89, 255, 0.3)' : 'none',
				border: isActive ? '1.5px solid #8459FF' : 'none'
			}}
				onClick={() => onSelect(id)}
			>
				<Box sx={{
					width: 100, height: '100%', backgroundColor: '#FFF', borderRadius: 4,
					display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1.5, mr: 1.5
				}}>
					<RideOptionIcon src={icon} />
				</Box>
				<Box sx={{ flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(80px, 1fr))', gridGap: 10 }}>
					<RideOptionValue icon={blue_value_icon} value={blueValue} label="CINERGY" />
					<RideOptionValue icon={orange_value_icon} value={orangeValue} label="CINERGY" />
					<RideOptionValue icon={green_value_icon} value={greenValue} label="Min" />
				</Box>
			</Box>
		)
	};
type NavigationProps = {
	onBack?: () => void,
	onStart?: (optionId: string | number) => void,
}
const Navigation: FC<NavigationProps> = ({ onBack, onStart }) => {
	const classes = useStyle()
	const [selectedOption, setSelectedOption] = useState<string | number>('WALK');
	const handleChangeOption = (id: string | number) => {
		setSelectedOption(id)
	}
	return (
		<Box className={classes.root}>
			<Box className={classes.content}>
				<Box className={classes.top}>
					<Box className={classes.itemSummary}>
						{/* <ItemSummarySegment /> */}
					</Box>
					<Box sx={{ display: 'flex', mb: 1.25 }}>
						<Typography fontSize={16} fontWeight={400} lineHeight="16px">Distance</Typography>
					</Box>
					<Box sx={{
						width: 1, height: 88, display: 'flex', alignItems: 'center',
						justifyContent: 'space-between', borderRadius: 5, px: 3, mb: 2.5,
						background: 'rgba(132, 89, 255, 0.05)', border: '1px solid rgba(132, 89, 255, 0.1)'
					}}
					>
						<DistanceIcon src={distance_png} />
						<Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
							<Typography fontSize={35} fontWeight={700} lineHeight="35px">1450</Typography>
							<Typography fontSize={20} fontWeight={400} lineHeight="20px">m</Typography>
						</Box>
					</Box>
					<RideOption
						id='WALK' icon={walk_icon} blueValue={30} orangeValue={12}
						greenValue={20} selectedId={selectedOption} onSelect={handleChangeOption}
					/>
					<RideOption
						id='BIKE' icon={bike_icon} blueValue={30} orangeValue={12}
						greenValue={20} selectedId={selectedOption} onSelect={handleChangeOption}
					/>
					<RideOption
						id='TAXI' icon={taxi_icon} blueValue={30} orangeValue={12}
						greenValue={20} selectedId={selectedOption} onSelect={handleChangeOption}
					/>
				</Box>
				<Box sx={{ width: 1, display: 'flex', alignItems: 'center' }} >
					<Button
						variant="contained"
						color="primary"
						onClick={onBack}
						sx={{
							width: 60, height: 60, display: 'flex', justifyContent: 'center', alignItems: 'center',
							backgroundColor: '#2D9AFF', borderRadius: 4, boxShadow: '0px 5px 15px rgba(45, 154, 255, 0.5), inset 0px -4px 0px rgba(0, 0, 0, 0.1)', mr: 2.5,
							'&:hover': {
								backgroundColor: '#2D9AFF',
								boxShadow: '0px 5px 15px rgba(45, 154, 255, 0.5), inset 0px -4px 0px rgba(0, 0, 0, 0.1)',
							},
							'&img': { width: 22 }
						}}
					>
						<img src={arrow_left} alt="." />
					</Button>
					<Button
						variant="contained"
						color="primary"
						onClick={onBack}
						sx={{
							flexGrow: 1, height: 60, display: 'flex', justifyContent: 'center', alignItems: 'center',
							backgroundColor: '#2D9AFF', borderRadius: 4, boxShadow: '0px 5px 15px rgba(45, 154, 255, 0.5), inset 0px -4px 0px rgba(0, 0, 0, 0.1)',
							fontWeight: 500, fontSize: 22, color: '#FFF',
							'&:hover': {
								backgroundColor: '#2D9AFF',
								boxShadow: '0px 5px 15px rgba(45, 154, 255, 0.5), inset 0px -4px 0px rgba(0, 0, 0, 0.1)',
							},
						}}
					>
						Start Ride
					</Button>
				</Box>
			</Box>
		</Box>
	);
}

export default Navigation;
