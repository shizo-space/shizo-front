import React, { FC, useState } from 'react'
import makeStyles from '@mui/styles/makeStyles'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { ReactComponent as Checked } from '../../assets/Checked.svg'
import SvgIcon from '@mui/material/SvgIcon'
import { Button, Paper } from '@mui/material'

const useStyle = makeStyles((theme: any) => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 375,
    height: '100vh',
    paddingTop: 128,
    backgroundColor: theme?.palette?.mode === 'dark' ? 'rgba(11, 18, 22, 0.95)' : '#FFF',
    zIndex: 2,
    overflowX: 'hidden',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: 10,
      height: 10,
      backgroundColor: 'rgba(0, 0, 0, 0)',
      WebkitBorderRadius: 100,

      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.09)',
      },
    },
    '&::-webkit-scrollbar-thumb': {
      '&:vertical': {
        background: '#babac0',
        WebkitBorderRadius: 100,
        backgroundClip: 'padding-box',
        border: '2px solid rgba(0, 0, 0, 0)',
        minHeight: 10,
      },
      '&:active': {
        background: '#babac0',
        WebkitBorderRadius: 100,
      },
    },
  },
  content: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: 30,
  },
  loading: {
    alignSelf: 'center',
  },
  top: {
    flexGrow: 1,
    flexShrink: 0,
  },
  topInfo: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameSegment: {
    flexGrow: 1,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
  },
  textarea: {
    height: 'auto',
    minHeight: 196,
  },
  colors: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, 40px)',
    gridGap: 11,
  },
}))

type EditEntityProps = {
  data: any
  onCancel: () => void
  onSave: (form: object) => void
}

const colors: Array<string> = [
  '#AAE0FA',
  '#57C8FF',
  '#189EFF',
  '#0047FF',
  '#561BFF',
  '#AD5AFF',
  '#FFCA08',
  '#F7941D',
  '#F25822',
  '#D8DF20',
  '#71BF45',
  '#00A65E',
  '#F5F5F5',
  '#BDBDBD',
  '#808080',
  '#606060',
  '#303030',
  '#101010',
]
export type Fields = {
  name: string
  description: string
  color?: string
  embeddedLink?: string
  externalLink?: string
}
const EditEntity: FC<EditEntityProps> = ({ data, onCancel, onSave }) => {
  const classes = useStyle()
  const [fields, setFields] = useState<Fields>({
    name: data.name ?? '',
    description: data.description ?? '',
    color: data.color ?? '#F5F5F5',
    embeddedLink: data.embeddedLink ?? '',
    externalLink: data.externalLink ?? '',
  })

  const handleChangeField = (fieldName: string, value: string): void => {
    setFields(prevState => ({
      ...prevState,
      [fieldName]: value,
    }))
  }

  return (
    <Box component={Paper} className={classes.root}>
      <Box className={classes.content}>
        <Box className={classes.top}>
          <Box sx={{ mb: 0.5 }}>
            <Typography fontWeight={400} fontSize={12} lineHeight="18px" color={'#949494'}>
              Name
            </Typography>
          </Box>
          <OutlinedInput
            value={fields.name}
            style={{
              background:
                'linear-gradient(243.83deg, rgba(94, 190, 221, 0.2) 25.02%, rgba(107, 220, 198, 0.2) 62.79%)',
            }}
            fullWidth
            onChange={e => {
              handleChangeField('name', e.target.value)
            }}
          />
          <Box>
            <Box sx={{ mb: 0.5, mt: 1 }}>
              <Typography fontWeight={400} fontSize={12} lineHeight="18px" color={'#949494'}>
                Description
              </Typography>
            </Box>
            <OutlinedInput
              value={fields.description}
              className={classes.textarea}
              style={{
                background:
                  'linear-gradient(243.83deg, rgba(94, 190, 221, 0.2) 25.02%, rgba(107, 220, 198, 0.2) 62.79%)',
              }}
              onChange={e => {
                handleChangeField('description', e.target.value)
              }}
              rows={8}
              multiline
              fullWidth
            />
          </Box>

          <Box>
            <Box sx={{ mb: 0.5, mt: 1 }}>
              <Typography fontWeight={400} fontSize={12} lineHeight="18px" color={'#949494'}>
                Theta Video Link
              </Typography>
            </Box>
            <OutlinedInput
              value={fields.embeddedLink}
              style={{
                background:
                  'linear-gradient(243.83deg, rgba(94, 190, 221, 0.2) 25.02%, rgba(107, 220, 198, 0.2) 62.79%)',
              }}
              onChange={e => {
                handleChangeField('embeddedLink', e.target.value)
              }}
              fullWidth
            />
          </Box>

          <Box>
            <Box sx={{ mb: 0.5, mt: 1 }}>
              <Typography fontWeight={400} fontSize={12} lineHeight="18px" color={'#949494'}>
                External Link
              </Typography>
            </Box>
            <OutlinedInput
              value={fields.externalLink}
              style={{
                background:
                  'linear-gradient(243.83deg, rgba(94, 190, 221, 0.2) 25.02%, rgba(107, 220, 198, 0.2) 62.79%)',
              }}
              onChange={e => {
                handleChangeField('externalLink', e.target.value)
              }}
              fullWidth
            />
          </Box>

          {data.isBuilding && (
            <Box>
              <Box sx={{ mb: 1, mt: 2 }}>
                <Typography fontWeight={400} fontSize={12} lineHeight="18px" sx={{ color: '#505050' }}>
                  Color
                </Typography>
              </Box>
              <Box className={classes.colors}>
                {colors.map(c => (
                  <IconButton
                    key={c}
                    sx={{
                      border: 'none',
                      backgroundColor: c,
                      '&:hover': { backgroundColor: `${c}AA` },
                      width: 40,
                      height: 40,
                    }}
                    onClick={() => handleChangeField('color', c)}
                  >
                    {fields.color === c && (
                      <SvgIcon viewBox="0 0 15 12" component={Checked} sx={{ color: 'transparent' }} />
                    )}
                  </IconButton>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ flexShrink: 0, mt: 2 }}>
          <Button
            sx={{ mb: 2 }}
            variant="contained"
            fullWidth
            size="large"
            style={{
              background: 'linear-gradient(243.83deg, #5EBEDD 25.02%, #6BDCC6 62.79%)',
              fontWeight: 700,
            }}
            onClick={() => onSave(fields)}
          >
            Save Changes
          </Button>
          <Button variant="outlined" fullWidth size="large" color="error" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default EditEntity
