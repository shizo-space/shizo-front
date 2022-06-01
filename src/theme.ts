import { createTheme } from '@mui/material/styles'

const fontName = 'Baloo Tamma 2'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2D9AFF',
      dark: '#0057FF',
    },
    secondary: {
      main: '#8459FF',
      dark: '#552BD0',
    },
    warning: {
      main: '#FF6422',
    },
    text: {
      primary: '#000',
    },
    success: {
      main: '#1FC780',
      dark: '#009E5C',
    },
    grey: {
      '100': '#FFFFFF',
      '200': '#BDBDBD',
      '500': '#808080',
      '900': '#000000',
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
    h1: {
      fontSize: '35px',
    },
    h2: {
      fontSize: '25px',
    },
    h3: {
      fontSize: '22px',
    },
    h4: {
      fontSize: '20px',
    },
    h5: {
      fontSize: '16px',
    },
    h6: {
      fontSize: '14px',
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
          // border: '1px solid rgba(20, 92, 255, 0.3)',
          borderRadius: '25px',
          boxShadow: '0px 5px 15px rgba(45, 154, 255, 0.5), inset 0px -4px 0px 1px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#2D9AFF',
          '&:hover': {
            backgroundColor: '#0057FF',
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
        containedPrimary: {
          backgroundColor: '#1FC780',
          borderRadius: 15,
          height: 60,
          boxShadow: '0px 5px 15px rgba(31, 199, 128, 0.5), inset 0px -4px 0px 1px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            backgroundColor: '#009E5C',
          },
        },
        containedSecondary: {
          backgroundColor: '#2D9AFF',
          borderRadius: 15,
          height: 54,
          boxShadow: 'inset 0px -4px 0px 1px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            backgroundColor: '#0057FF',
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
        fontFamily: fontName,
      },
    },
  },
})

export default theme
