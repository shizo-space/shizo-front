import React, { FC } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import Box from '@mui/material/Box'
import { CardActionArea, LinearProgress } from '@mui/material'
import Typography from '@mui/material/Typography'
import { useHistory } from 'react-router-dom'

const useStyle = makeStyles({
  root: {
    paddingTop: 32,
    width: '100%',
    // backgroundColor: '#FFF',
  },
  meta: {
    width: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  overlay: {
    position: 'fixed',
    width: '100vw',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100vh',
    zIndex: -1,
  },
})
type SearchResultsProps = {
  loading: boolean
  data?: any[]
  onClear: () => void
  onSelect: (data: any) => any
}
const SearchResults: FC<SearchResultsProps> = ({ data, loading, onClear, onSelect }) => {
  const classes = useStyle()
  const history = useHistory()
  const handleClick = data => {
    history.push(`/${data.id}`)
    onClear()
    onSelect(data)
  }
  if (loading) {
    return <LinearProgress sx={{ mt: 1, mx: 2 }} />
  }
  if (data) {
    return (
      <>
        <Box className={classes.root}>
          {data.map(d => (
            <CardActionArea
              onClick={() => {
                handleClick(d)
              }}
              sx={{ mb: 3 }}
            >
              <Box sx={{ px: 1.5 }}>
                <Box sx={{ mb: 0.25 }}>
                  <Typography fontWeight={600} fontSize={16} lineHeight="26px">
                    {d.name}
                  </Typography>
                </Box>
                <Typography className={classes.meta} fontWeight={300} fontSize={14} lineHeight="22px">
                  {`${d.meta}`}
                </Typography>
              </Box>
            </CardActionArea>
          ))}
        </Box>
        <Box onClick={onClear} className={classes.overlay} />
      </>
    )
  }
  return null
}

export default SearchResults
