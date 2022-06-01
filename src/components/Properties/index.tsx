import {
  Box,
  Divider,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { makeStyles } from '@mui/styles'
import { FC, useEffect, useState } from 'react'
import Logo from '../../assets/metagate.png'
import Paper from '@mui/material/Paper'
import { ReactComponent as LocationIcon } from '../../assets/Location.svg'
import { ReactComponent as NoteIcon } from '../../assets/note-grey.svg'
import { ReactComponent as ViewIcon } from '../../assets/views-grey.svg'
import axios from 'axios'
import { useRequest } from 'ahooks'
import { useHistory } from 'react-router-dom'
import useEvmWallet from '../../adaptors/evm-wallet-adaptor/useEvmWallet'

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
  const { data } = await axios.post('https://map.metagate.land/features/list/', {
    merge_ids: lands.map(l => l.token_id),
  })
  return data
}

const Properties: FC = ({}) => {
  const { evmWallet } = useEvmWallet()
  // const { properties: lands } = useNftContract(wallet)
  const lands = []
  const { run: fetchFeatures, data: properties } = useRequest<any, [any]>(lands => getFeatures(lands), {
    manual: true,
  })
  const history = useHistory()

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
        <Box
          className={classes.logo}
          component="img"
          sx={{
            cursor: 'pointer',
          }}
          alt="MetaGate"
          src={Logo}
          onClick={() => {
            history.push('/')
          }}
        />
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
              {properties?.reverse().map((property, i) => (
                <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {property.name?.length > 0 ? property.name : 'Unnamed'}
                  </TableCell>
                  <TableCell align="left">{property.description}</TableCell>
                  <TableCell align="center">{property.view}</TableCell>
                  <TableCell align="right">
                    <SvgIcon
                      component={LocationIcon}
                      viewBox="0 0 24 24"
                      sx={{ color: 'transparent', cursor: 'pointer' }}
                      onClick={() => {
                        window.open(`https://map.metagate.land/${property.merge_id}`, '_blank')?.focus()
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
