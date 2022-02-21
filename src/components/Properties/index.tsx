import { Box, Divider, SvgIcon, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { FC, useEffect, useState } from 'react'
import Logo from '../../assets/shizo.png'
import Paper from '@mui/material/Paper'
import { ReactComponent as LocationIcon } from '../../assets/Location.svg'
import { ReactComponent as NoteIcon } from '../../assets/note-grey.svg'
import { ReactComponent as ViewIcon } from '../../assets/views-grey.svg'
import useNftContract from '../../hooks/useNftContract'
import useNearWallet from '../../adapters/near-wallet/useNearWallet'
import axios from 'axios'
import { useRequest } from 'ahooks'

const useStyle = makeStyles({
  root: {
    width: '100%',
    padding: 25,
  },
  logo: {
    width: 60,
  },
})

const getFeatures = async (lands): Promise<any> => {
  const { data } = await axios.post('https://shizo.space/features/list/', {
    merge_ids: lands.map(l => l.token_id),
  })
  return data
}

const Properties: FC = ({}) => {
  const { wallet } = useNearWallet()
  const { properties: lands } = useNftContract(wallet)
  const { run: fetchFeatures, data: properties } = useRequest<any, [any]>(lands => getFeatures(lands), { manual: true })

  useEffect(() => {
    if (!lands || lands.length === 0) {
      return
    }
    fetchFeatures(lands)
  }, [lands])

  const classes = useStyle()
  return (
    <Box className={classes.root}>
      <Box sx={{ mb: 5.5 }}>
        <img src={Logo} className={classes.logo} alt="SHIZO" />
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography fontSize={22} fontWeight={700}>
          My Properties
        </Typography>
      </Box>
      {/* <Divider sx={{ mb: 2.5 }} light={true} /> */}
      <Box>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="left">
                  <SvgIcon component={NoteIcon} viewBox="0 0 24 24" sx={{ mr: 1 }} />
                  Description
                </TableCell>
                <TableCell align="center">
                  <SvgIcon component={ViewIcon} viewBox="0 0 24 24" sx={{ mr: 1 }} />
                  Views
                </TableCell>
                <TableCell align="right">Map</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties?.map((property, i) => (
                <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {property.name && property.name.length > 0 ? property.name : 'Unnamed'}
                  </TableCell>
                  <TableCell align="left">{property.description}</TableCell>
                  <TableCell align="center">{property.view}</TableCell>
                  <TableCell align="right">
                    <SvgIcon
                      component={LocationIcon}
                      viewBox="0 0 24 24"
                      sx={{ color: 'transparent', cursor: 'pointer' }}
                      onClick={() => {
                        window.open(`https://shizo.space/map/${property.merge_id}`, '_blank')?.focus()
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
  //   return <div></div>
}

export default Properties
