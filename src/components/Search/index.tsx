import React, { FC, useState } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'
import Logo from '../../assets/shizo.png'
import { useRequest } from 'ahooks'
import SearchResults from './SearchResults'
import axios from 'axios'
import { ReactComponent as SearchIcon } from '../../assets/Search.svg'
import { InputAdornment, SvgIcon } from '@mui/material'

const useStyle = makeStyles({
  root: {
    width: '100%',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    boxShadow: '4px 0px 15px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#FFF',
    padding: 25,
    zIndex: 2,
    position: 'relative',
  },
  logo: {
    width: 60,
  },
})

const service = (query: string) => {
  if (query.length < 3) {
    return new Promise(resolve => resolve([]))
  }
  return axios.get(`https://shizo.space/search/?q=${query}&lat=0&long=0`)
}

type SearchProps = {
  onSelect: (data: any) => void
}

const Search: FC<SearchProps> = ({ onSelect }) => {
  const classes = useStyle()
  const [text, setText] = useState<string>('')
  const [results, setResults] = useState<any>(null)
  const { run, loading } = useRequest<any, [string]>((query): any => service(query), {
    manual: true,
    debounceWait: 500,
    onSuccess: res => {
      const data = res.data?.map(r => ({
        id: r.merge_id,
        name: r.name,
        meta: r.description,
        lat: r.lat,
        lon: r.long,
      }))
      setResults(data ?? [])
    },
  })

  const handleInputChange = e => {
    setText(e.target.value)
    run(e.target.value)
  }

  const handleClear = () => {
    setResults(null)
  }
  return (
    <>
      <Box className={classes.root}>
        <Box sx={{ mb: 2.5 }}>
          <img onClick={() => {}} src={Logo} className={classes.logo} alt="SHIZO" />
        </Box>
        <OutlinedInput
          placeholder="Search Shizo"
          fullWidth
          value={text}
          onChange={handleInputChange}
          endAdornment={
            <InputAdornment position="end">
              <SvgIcon component={SearchIcon} sx={{ color: 'transparent' }} viewBox="0 0 24 24" />
            </InputAdornment>
          }
        />
        <SearchResults onSelect={onSelect} loading={loading} data={results} onClear={handleClear} />
      </Box>
    </>
  )
}

export default Search
