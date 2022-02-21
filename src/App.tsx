import { Map } from './components/Map'
import './App.css'
import NearConnectionProvider from './adapters/near-connection/NearConnectionProvider'
import NearWalletProvider from './adapters/near-wallet/NearWalletProvider'
import CssBaseline from '@mui/material/CssBaseline';
import Container from "@mui/material/Container";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'
import Router from './Router'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NearConnectionProvider>
        <NearWalletProvider>
          <>
            <Container>
            </Container>
          </>
          <Router />
        </NearWalletProvider>
      </NearConnectionProvider>
    </ThemeProvider>
  )
}

export default App
