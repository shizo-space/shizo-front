import { SvgIcon, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { DefaultTooltipContent } from 'recharts/lib/component/DefaultTooltipContent'
import { shortenAddress } from '../../utils'
import { ReactComponent as Tfuel } from '../../assets/tfuel.svg'
import { ReactComponent as Calendar } from '../../assets/Calendar.svg'

export const CustomTooltipContent = props => {
  // payload[0] doesn't exist when tooltip isn't visible
  if (props?.active || props?.payload[0] != null) {
    // mutating props directly is against react's conventions
    // so we create a new payload with the name and value fields set to what we want
    const newPayload = [
      {
        name: 'Date',
        // all your data which created the tooltip is located in the .payload property
        value: props.payload[0].payload.date,
        // you can also add "unit" here if you need it
      },
      {
        name: 'Seller',
        value: props.payload[0].payload.seller,
      },
      {
        name: 'Buyer',
        value: props.payload[0].payload.buyer,
      },
      ...props.payload,
    ]

    // we render the default, but with our overridden payload
    // return <DefaultTooltipContent {...props} payload={newPayload} />
    return (
      <Box
        sx={{
          width: '406px',
          height: '188px',
          background: '#192730',
          backdropFilter: 'blur(30px);',
          paddingX: 4,
          paddingY: 2,
        }}
      >
        <Box
          sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'around' }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', fontWeight: 400 }}>
                Seller
              </Typography>
              <Typography sx={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700 }}>
                {shortenAddress(props.payload[0].payload.seller, 4, 8)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'around' }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', fontWeight: 400 }}>
                Buyer
              </Typography>
              <Typography sx={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700 }}>
                {shortenAddress(props.payload[0].payload.buyer, 4, 8)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'start' }}>
            <SvgIcon component={Tfuel} viewBox="0 0 24 24" sx={{ mr: 1.25, flexShrink: 0 }} />
            <Typography fontWeight="700">{props.payload[0].payload.price} TFUEL</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'start' }}>
            <SvgIcon
              component={Calendar}
              viewBox="0 0 24 24"
              sx={{ mr: 1.25, flexShrink: 0, color: 'transparent' }}
            />
            <Typography fontWeight="400">{props.payload[0].payload.date}</Typography>
          </Box>
        </Box>
      </Box>
    )
  }

  // we just render the default
  return <DefaultTooltipContent {...props} />
}
