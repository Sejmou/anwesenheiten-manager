import { SessionProvider } from 'next-auth/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import {
  Box,
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

import './globals.css';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    background: {
      default: '#eeeeee',
    },
  },
});

// for some reason, typing the input object as AppProps returns a super-weird error
const App = ({ Component, pageProps }: any) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={pageProps.session}>
        <ThemeProvider theme={theme}>
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <CssBaseline />
            <Header sx={{ flex: '0 1 auto' }} />
            <Container
              sx={{
                minHeight: '100%',
                flex: '1',
                py: 2,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Component {...pageProps} />
            </Container>
            <Footer sx={{ flex: '0 1 auto' }} />
          </Box>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default App;
