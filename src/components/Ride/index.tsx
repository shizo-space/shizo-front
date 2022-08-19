import React, { FC } from 'react'
import Box from '@mui/material/Box'
import styled from '@mui/system/styled'
import walk_icon from '../../assets/walk-icon.png';
import taxi_icon from '../../assets/taxi-icon.png';
import bike_icon from '../../assets/bike-icon.png';
import blue_value_icon from '../../assets/blue_value.png';
import green_value_icon from '../../assets/green_value.png';
import orange_value_icon from '../../assets/orange_value.png';
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const rideIcons = {
    WALK: walk_icon,
    BIKE: bike_icon,
    TAXI: taxi_icon,
}
const RideOptionIcon = styled('img')({
    height: '100%',
});

const RideValueIcon = styled('img')({
    height: 30,
    width: 30,
    marginRight: 10,
});

const RideInfo: FC<{
    icon: string,
    value: number,
    currency: string,
    label: string,
}> = ({icon, value, currency, label}) => {
    return (
        <Box sx={{
            height: '100%', minWidth: 140, borderRadius: 4, mr: 2.5, '&:last-child': { mr: 0 },
            backgroundColor: '#FFF', p: 1.75, display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }} >
                <RideValueIcon src={icon} />
                <Box sx={{ display: 'flex', direction: 'column' }} >
                    <Typography fontSize={25} fontWeight={500} lineHeight="22px">{value}</Typography>
                    <Typography fontSize={12} fontWeight={400} lineHeight="12px">{currency}</Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }} >
                <Typography fontSize={15} fontWeight={400} lineHeight="12px">{label}</Typography>
            </Box>
        </Box>
    )
}
type RideProps = {
    type: string,
    onFinish?: () => void,
    onCancel?: () => void,
}
const Ride: FC<RideProps> = ({type, onCancel, onFinish}) => {
    return (
        <Box sx={{
            width: 'calc(100% - 562px)', position: 'fixed', bottom: 0, backgroundColor: '#FFF',
            borderTopLeftRadius: 5, borderTopRightRadius: 5, display: 'flex', alignItems: 'center',
            right: 76, height: 160, boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1)', p:1.25  }} >
            <Box sx={{ height: '100%', p: 2.5, background: '#F9F7FF', borderRadius: 5, mr: 2.5 }}>
                <Box sx={{
                    width: 100, height: 100, backgroundColor: '#FFF', borderRadius: 4,
                    display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1.5, mr: 2.5
                }}>
                    <RideOptionIcon src={rideIcons[type]} />
                </Box>
                <RideInfo icon={blue_value_icon} value={302.53} currency="SHIN" label="TOTAL BURNED" />
                <RideInfo icon={green_value_icon} value={20} currency="Min" label="ETA" />
                <RideInfo icon={orange_value_icon} value={250} currency="SHIN" label="TOTAL AMOUNT" />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch', flexGrow: 1, justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onCancel}
                    sx={{
                        width: '100%', height: 54, display: 'flex', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: '#2D9AFF', borderRadius: 4, boxShadow: 'inset 0px -4px 0px 1px rgba(0, 0, 0, 0.1)',
                        fontWeight: 500, fontSize: 22, color: '#FFF', mb: 1.5,
                        '&:hover': {
                            backgroundColor: '#3EAC00',
                            boxShadow: 'inset 0px -4px 0px 1px rgba(0, 0, 0, 0.1)',
                        },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onFinish}
                    sx={{
                        width: '100%', height: 54, display: 'flex', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: '#1FC780', borderRadius: 4, boxShadow: 'inset 0px -4px 0px 1px rgba(0, 0, 0, 0.1)',
                        fontWeight: 500, fontSize: 22, color: '#FFF',
                        '&:hover': {
                            backgroundColor: '#30D891',
                            boxShadow: 'inset 0px -4px 0px 1px rgba(0, 0, 0, 0.1)',
                        },
                    }}
                >
                    Finish
                </Button>
            </Box>
        </Box>
    )
}

export default Ride;
