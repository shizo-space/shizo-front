import { Typography } from '@mui/material'
import { Box } from '@mui/system'

const SaleStatus = ({ forSale }) => {
  const backgroundColor = forSale ? 'rgba(20, 86, 255, 0.05)' : 'rgba(242, 88, 34, 0.05)'
  const fontColor = forSale ? '#1456FF' : '#F25822'

  return (
    <Box
      sx={{
        width: '180px',
        height: '40px',
        borderRadius: '10px',
        backgroundColor,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography fontSize={14} color={fontColor}>
        {forSale ? 'Available for sale' : 'Not available for sale'}
      </Typography>
    </Box>
  )
}

export default SaleStatus
