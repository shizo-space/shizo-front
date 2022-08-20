import React, { FC } from 'react'
import Box from '@mui/material/Box';
import { styled } from '@mui/styles'
import Typography from '@mui/material/Typography';
import walk_icon from '../../assets/toll-Walk.png';
import bike_icon from '../../assets/toll-Bicycle.png';
import taxi_icon from '../../assets/toll-Taxi.png';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';

const RoadCostIcon = styled('img')({
	height: '100%',
	marginRight: 8,
});

const RoadCost: FC<{
	icon: string,
	value: number,
	color: string,
}> = ({ value, icon, color }) => {
	return (
		<Box
			sx={{
				display: 'flex', alignItems: 'center', height: 40,
				borderRadius: 2.5, p: 1, mr: 1.25, backgroundColor: color
			}}
		>
			<RoadCostIcon src={icon} />
			<Typography fontWeight={500} fontSize={22} lineHeight="22px">{value}</Typography>
		</Box>
	);
};

const RoadLimitationType: FC<{
	value: 'BLOCKED' | 'TWO_WAY',
	onChange: (v: 'BLOCKED' | 'TWO_WAY') => void,
}> = ({ value, onChange }) => {
	return (
		<Box sx={{
			display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative',
			px: 5.5, width: 280, height: 50, borderRadius: 4, border: '1px solid rgba(132, 89, 255, 0.2)',
			userSelect: 'none'
		}}
		>
			<Box
				sx={{
					width: 140, height: 40, top: 4, transition: 'all ease-out 0.4s', zIndex: 0, borderRadius: 3,
					position: 'absolute', backgroundColor: value === 'TWO_WAY' ? '#8459FF' : '#FF3030',
					left: value === 'TWO_WAY' ? 5 : 135
				}}
			/>
			<Typography
				onClick={() => { onChange('TWO_WAY') }}
				sx={{ color: value === 'TWO_WAY' ? '#FFF' : '#909090', zIndex: 2, cursor: 'pointer' }}
				fontWeight={500} fontSize={16} lineHeight="16px"
			>
				Two Way
			</Typography>
			<Typography
				onClick={() => { onChange('BLOCKED') }}
				sx={{ color: value === 'BLOCKED' ? '#FFF' : '#909090', zIndex: 2, cursor: 'pointer' }}
				fontWeight={500} fontSize={16} lineHeight="16px"
			>
				Blocked
			</Typography>
		</Box>
	)
}

type RoadLimitationsTypes = {
	onEdit: () => void,
	limitationType: 'BLOCKED' | 'TWO_WAY',
	onChangeLimitationType: (v: 'BLOCKED' | 'TWO_WAY') => void,
}

const RoadLimitations: FC<RoadLimitationsTypes> = ({ limitationType, onChangeLimitationType, onEdit }) => {
	return (
		<Box sx={{ mt: -1, width: 1, mb: 3.5 }} >
			<Box sx={{ display: 'flex', mb: 1.25 }} >
				<Typography fontWeight={400} fontSize={16} lineHeight="16px" color="#808080">Toll amount</Typography>
			</Box>
			<Box sx={{ display: 'flex', width: 1, alignItems: 'center', mb: 3.75 }} >
				<RoadCost icon={walk_icon} value={100} color="rgba(121, 137, 137, 0.1)" />
				<RoadCost icon={bike_icon} value={120} color="rgba(19, 223, 125, 0.1)" />
				<RoadCost icon={taxi_icon} value={120} color="rgba(255, 153, 0, 0.1)" />
				<IconButton onClick={onEdit} sx={{ background: 'transparent', boxShadow: 'none', '&:hover': { background: 'transparent' } }}>
					<EditIcon sx={{ color: '#8459FF', fontSize: '1.5rem' }} />
				</IconButton>
			</Box>
			<Box sx={{ display: 'flex', mb: 1.25 }} >
				<Typography fontWeight={400} fontSize={16} lineHeight="16px" color={'#808080'}>Limitation</Typography>
			</Box>
			<RoadLimitationType value={limitationType} onChange={onChangeLimitationType} />
		</Box>
	);
}

export default RoadLimitations;
