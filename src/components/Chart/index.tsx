import React, { FC } from 'react'
import Box from '@mui/material/Box'
import {
  Dot,
  Line,
  CartesianGrid,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
  Tooltip,
} from 'recharts'
import { Dialog, DialogContent, DialogTitle, Typography } from '@mui/material'
import { CustomTooltipContent } from './CustomTooltip'

type ChartData = {
  date: string
  price: number
}

type ChartProps = {
  data: ChartData[]
  onClose: () => void
}

const Chart: FC<ChartProps> = ({ data, onClose, ...rest }) => {
  data = data.map(d => ({ ...d, date: new Date(d.date).toLocaleDateString() }))
  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="xl"
      PaperProps={{
        sx: {
          background: 'rgba(11, 18, 22, 0.9)',
        },
      }}
    >
      <DialogTitle title="Trading History">
        <Typography align="center">Trading History</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContent>
          <Box
            sx={{
              width: '100%',
              maxWidth: 1024,
              maxHeight: 800,
              minHeight: 600,
              height: 600,
              fontSize: 17,
              fontWeight: 500,
              '&.recharts-cartesian-axis-tick': {
                '&:last-child': {
                  transform: 'translate(-12, 0)',
                },
              },
            }}
          >
            <ResponsiveContainer width="100%" height={600}>
              <LineChart data={data} margin={{ top: 10, left: 10, right: 20, bottom: 20 }}>
                <CartesianGrid color="#22343F" stroke="#22343F" />
                <defs>
                  <filter id="shadow" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="blur" />
                    <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
                    <feFlood floodColor="#6BDCC6" floodOpacity="0.5" result="offsetColor" />
                    <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur" />
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <YAxis type="number" stroke="#22343F" tick={{ transform: 'translate(-12, 0)' }} />
                <XAxis
                  type="category"
                  stroke="#22343F"
                  tick={{ transform: 'translate(0, 12)' }}
                  dataKey="date"
                />
                <Tooltip content={<CustomTooltipContent />} />

                <Line
                  filter="url(#shadow)"
                  dot={{ r: 8, strokeWidth: 3, fill: '#0B1216' }}
                  type="linear"
                  key={`AREA_`}
                  dataKey="price"
                  strokeWidth={2}
                  fillOpacity={1}
                  color="#5EBEDD"
                  stroke="#5EBEDD"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </DialogContent>
      </DialogContent>
    </Dialog>
  )
}

export default Chart

// import React, { FC } from 'react'
// import Box from '@mui/material/Box';
// import { Dot, Line, CartesianGrid, LineChart, XAxis, YAxis, ResponsiveContainer, Area } from 'recharts';
// import { Dialog, DialogContent, DialogTitle } from '@mui/material'
//
// const data = [
//   {
//     data: '14.2.2020',
//     price: 1,
//   },
//   {
//     data: '15.2.2020',
//     price: 3,
//   },
//   {
//     data: '16.2.2020',
//     price: 2,
//   },
//   {
//     data: '17.2.2020',
//     price: 4,
//   },
// ]
// const Chart: FC = () => {
//   return (
//     <Dialog open maxWidth="xl" PaperProps={{
//       sx: {
//         backgroundColor: 'rgba(11, 18, 22, 0.9)',
//       }
//     }}>
//       <DialogTitle title="Trading History">Tiles</DialogTitle>
//       <DialogContent>
//         <DialogContent>
//           <Box sx={{ width: '100%', maxWidth: 1024, maxHeight: 800, minHeight: 600, height: 600, fontSize: 17, fontWeight: 500 }}>
//             <ResponsiveContainer width="100%" height={500} >
//               <LineChart data={data}>
//                 <CartesianGrid color="#22343F" stroke="#22343F" style={{ borderColor: 'red' }} />
//                 <defs>
//                   <filter id="shadow" height="200%">
//                     <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="blur" />
//                     <feOffset in="blur" dx="0" dy="7" result="offsetBlur" />
//                     <feFlood floodColor="#109065" floodOpacity="0.5" result="offsetColor" />
//                     <feComposite
//                       in="offsetColor"
//                       in2="offsetBlur"
//                       operator="in"
//                       result="offsetBlur"
//                     />
//                     <feMerge>
//                       <feMergeNode />
//                       <feMergeNode in="SourceGraphic" />
//                     </feMerge>
//                   </filter>
//                 </defs>
//
//                 <YAxis type="number" domain={['auto', 'dataMax']} />
//                 <XAxis type="category"  dataKey="date" domain={['dataMin', 'dataMax']} />
//
//                 <Line
//                   // filter="url(#shadow)"
//                   dot={{ r: 8, strokeWidth: 3, fill: '#0B1216' }}
//                   type="linear"
//                   key={`AREA_`}
//                   dataKey="price"
//                   strokeWidth={2}
//                   fillOpacity={1}
//                   color="#5EBEDD"
//                   // stroke="#5EBEDD"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </Box>
//         </DialogContent>
//       </DialogContent>
//     </Dialog>
//   )
// }
//
// export default Chart;
