import { Map } from './components/Map'
import './App.css'
import NearConnectionProvider from './adaptors/near-connection/NearConnectionProvider'
import NearWalletProvider from './adaptors/near-wallet/NearWalletProvider'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import { ThemeProvider } from '@mui/material/styles'
import theme from './theme'
import Router from './Router'
import EvmWalletProvider from './adaptors/evm-wallet-adaptor/EvmWalletProvider'
import EvmProviderProvider from './adaptors/evm-provider-adaptor/EvmProviderProvider'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EvmWalletProvider>
        <EvmProviderProvider>
          <Container></Container>
          <Router />
        </EvmProviderProvider>
      </EvmWalletProvider>
    </ThemeProvider>
  )
}

export default App
