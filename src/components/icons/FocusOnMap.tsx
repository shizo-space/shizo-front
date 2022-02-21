import React, { FC } from 'react'
import { SvgIconProps } from '@mui/material/SvgIcon'
import SVGIcon from '@mui/material/SvgIcon'

const FocusOnMap: FC<SvgIconProps> = (props) => (
  <SVGIcon
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M16 12L18 10V12V14L16 12Z" />
    <path d="M20 12H16M16 12L18 10V14L16 12Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 12L6 14V12V10L8 12Z" />
    <path d="M4 12H8M8 12L6 14V10L8 12Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8L14 6H12H10L12 8Z" />
    <path d="M12 4V8M12 8L14 6H10L12 8Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 16L14 18H12H10L12 16Z" />
    <path d="M12 20V16M12 16L14 18H10L12 16Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </SVGIcon>
)

export default FocusOnMap
