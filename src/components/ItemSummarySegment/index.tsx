import { Box, SvgIcon, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { getRarityColor, hexToRgb } from '../../utils/color'

import { ReactComponent as Eye } from '../../assets/eye.svg'
import { ReactComponent as ShenSmall } from '../../assets/ShenIconSmall.svg'

const useStyle = makeStyles({
    root: {
        width: 360,
        height: 124,
        borderRadius: 15,
        color: '#FFFFFF',
    },
    content: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 15,
        paddingLeft: 15,
    },
    top: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    numOfViewsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    middleContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
    },
    potentialShenSection: {
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderRadius: 50,
        height: 31,
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 10,
        paddingLeft: 10,
        marginTop: 10,
        // gap: 5,
        // order: 1,
        // flexGrow: 0,
    },
    otherPropertiesSection: {
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderRadius: 39,
        height: 19,
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 10,
        paddingLeft: 10,
    },
    bottom: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 10,
    },
})

type ItemSummarySegmentProps = {
    name?: string
    osmName: string
    numberOfViews: number
    potentialShenPerWeek?: number
    level?: number
    rarity: number
}

const ItemSummarySegment = ({ name, osmName, numberOfViews, potentialShenPerWeek, rarity, level }) => {
    const classes = useStyle()
    const hexColor = getRarityColor(rarity)
    const secondaryHexColor = getRarityColor(rarity, true)
    const color = hexToRgb(hexColor)
	if(!color) {
		console.error(`Color is undefined for rarity of ${rarity}`)
		return 
	}
    return (
        <Box
            className={classes.root}
            sx={{
                boxShadow: `0px 5px 15px rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`,
                backgroundColor: getRarityColor(rarity),
            }}
            onClick={() => {
                console.log('clicked on the summary box')
            }}
        >
            <Box className={classes.content}>
                <Box className={classes.top}>
                    <Typography fontWeight={700} fontSize={22}>
						{name && name.length > 0 ? name : 'Unnamed'}
                    </Typography>
                    <Box className={classes.numOfViewsContainer}>
                        <SvgIcon
                            component={Eye}
                            viewBox='0 0 20 15'
                            sx={{ marginRight: 1, color: 'transparent' }}
                        />
                        <Typography fontWeight={400} fontSize={16} sx={{ marginBottom: -0.5 }}>
                            {numberOfViews}
                        </Typography>
                    </Box>
                </Box>
                <Box className={classes.middleContainer}>
                    <Typography fontWeight={400} fontSize={16}>
						{osmName}
                    </Typography>
                    <Box className={classes.potentialShenSection} sx={{ backgroundColor: secondaryHexColor }}>
                        <SvgIcon component={ShenSmall} viewBox='0 0 24 24' sx={{ color: 'transparent' }} />
                        <Typography fontWeight={700} fontSize={14} sx={{ marginBottom: -0.5 }}>
                            {potentialShenPerWeek ?? 10} | WEEK
                        </Typography>
                    </Box>
                </Box>
                <Box className={classes.bottom}>
                    <Box
                        className={classes.otherPropertiesSection}
                        sx={{ backgroundColor: secondaryHexColor }}
                    >
                        <Typography fontWeight={400} fontSize={12}>
                            LEVEL {level ?? 1}
                        </Typography>
                    </Box>
                    <Box
                        className={classes.otherPropertiesSection}
                        sx={{ backgroundColor: secondaryHexColor }}
                    >
                        <Typography fontWeight={400} fontSize={12}>
                            {getRarityText(rarity)}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function getRarityText(rarity) {
    if (rarity === 0) {
        return 'Common'
    }
    if (rarity === 1) {
        return 'Uncommon'
    }
    if (rarity === 2) {
        return 'Rare'
    }
    if (rarity === 3) {
        return 'Epic'
    }
    if (rarity === 4) {
        return 'Legendary'
    }
    throw new Error('rarity not defined!')
}

export default ItemSummarySegment
