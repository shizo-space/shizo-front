import React, { FC, useState } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'
import Logo from '../../assets/shizologo.png'
import { useRequest } from 'ahooks'
import SearchResults from './SearchResults'
import axios from 'axios'
import { ReactComponent as SearchIcon } from '../../assets/SearchIcon-Dark.svg'
import { IconButton, InputAdornment, Paper, SvgIcon, Typography } from '@mui/material'
import { useHistory } from 'react-router-dom'

const useStyle = makeStyles((theme: any) => ({
	root: {
		width: '100%',
		borderTopRightRadius: 0,
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 25,
		borderBottomRightRadius: 25,
		boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1), inset 0px -3px 0px 1px rgba(0, 0, 0, 0.1)',
		backgroundColor: '#FFFFFF',
		padding: 20,
		zIndex: 2,
		position: 'relative',
	},
	header: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
		flexDirection: 'row',
	},
	logo: {
		height: 18,
	},
}))

const service = (query: string, lat: number, lng: number) => {
	if (query?.length < 3) {
		return new Promise(resolve => resolve([]))
	}
	return axios.get(`https://map.metagate.land/search?q=${query}&lat=${lat}&lng=${lng}`)
}

type SearchProps = {
	onSelect: (data: any) => void
	viewport: any
}

const Search: FC<SearchProps> = ({ onSelect, viewport }) => {
	const classes = useStyle()
	const [text, setText] = useState<string>('')
	const [results, setResults] = useState<any>(null)
	const history = useHistory()
	const { run, loading } = useRequest<any, [string, number, number]>(
		(query, lat, lng): any => service(query, lat, lng),
		{
			manual: true,
			debounceWait: 500,
			onSuccess: res => {
				const data = res.data?.map(r => ({
					id: r.merge_id,
					name: r.name,
					meta: r.description,
					lat: r.lat,
					lon: r.long,
					animate: r.should_transit,
				}))
				setResults(data ?? [])
			},
		},
	)

	const handleInputChange = e => {
		setText(e.target.value)
		const { lng, lat } = viewport.center
		run(e.target.value, lat, lng)
	}

	const handleClear = () => {
		setResults(null)
	}
	return (
		<Box component={Paper} className={classes.root}>
			<Box className={classes.header} sx={{ mb: 2 }}>
				<Box
					className={classes.logo}
					component='img'
					sx={{
						cursor: 'pointer',
					}}
					alt='Shizo'
					src={Logo}
					onClick={() => {
						history.push('/')
					}}
				/>
			</Box>
			<OutlinedInput
				placeholder='Search Location'
				fullWidth
				value={text}
				onChange={handleInputChange}
				endAdornment={
					<InputAdornment position='end'>
						<IconButton>
							<SvgIcon
								component={SearchIcon}
								sx={{ color: 'transparent', padding: 0.25 }}
								viewBox='0 0 21 21'
							/>
						</IconButton>
					</InputAdornment>
				}
			/>
			<SearchResults onSelect={onSelect} loading={loading} data={results} onClear={handleClear} />
		</Box>
	)
}

export default Search
