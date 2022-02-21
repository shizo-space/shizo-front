import { createTheme } from '@mui/material/styles'

const fontName = 'Poppins'

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#1456FF',
    },
    secondary: {
      main: '#0084FF',
    },
    warning: {
      main: '#F25822',
    },
    text: {
      primary: '#000',
    },
    success: {
      main: '#00A65E',
    },
    action: {
      disabledBackground: 'rgba(242, 88, 34, 0.1)',
      disabled: '#F25822;',
    },
  },
  typography: {
    fontFamily: fontName,
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: `rgba(0, 0, 0, 0.15) !important`,
          backdropFilter: `blur(4px)`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          height: 44,
          borderRadius: 22,
          '.fieldset': {
            border: 'none',
          },
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
        },
        notchedOutline: {
          border: 'none !important',
        },
        input: {
          fontFamily: fontName,
          fontSize: 14,
          fontWeight: 400,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(20, 92, 255, 0.3)',
          backgroundColor: 'rgba(20, 86, 255, 0.05)',
          '&:hover': {
            backgroundColor: 'rgba(20, 86, 255, 0.25)',
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        rectangular: {
          borderRadius: 8,
        },
        text: {
          borderRadius: 8,
        },
      },
      defaultProps: {
        animation: 'wave',
        variant: 'rectangular',
      },
    },
    MuiButton: {
      styleOverrides: {
        sizeLarge: {
          borderRadius: 27,
          height: 54,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          width: '90%',
          maxWidth: 1024,
          minHeight: 500,
          borderRadius: 25,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        fontFamily: 'Poppins',
      },
    },
  },
})

export default theme
