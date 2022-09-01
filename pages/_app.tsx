import { SessionProvider } from 'next-auth/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import Footer from '../components/layout/Footer';

import './globals.css';
import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    background: {
      default: '#eeeeee',
    },
  },
});

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// for some reason, typing the input object as AppProps (and also AppPropsWithLayout) returns a super-weird error
const App = ({ Component, pageProps }: any) => {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page: NextPage) => page);

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
            {getLayout(<Component {...pageProps} />)}
            <Footer sx={{ flex: '0 1 auto' }} />
          </Box>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default App;
