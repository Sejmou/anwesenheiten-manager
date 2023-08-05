import { SessionProvider } from 'next-auth/react';
import { api } from 'utils/api';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactElement, ReactNode } from 'react';
import { Box, createTheme, CssBaseline, ThemeProvider } from '@mui/material';

import globalMessageStore from 'lib/message-store';
import { StoreProvider } from 'easy-peasy';
import './globals.css';
import GlobalMessageSnackbar from 'components/GlobalMessageSnackbar';
import Footer from 'components/layout/Footer';

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

// workaround for broken easy peasy StoreProvider typing in React 18: https://github.com/ctrlplusb/easy-peasy/issues/741#issuecomment-1110810689
// TODO: get a better understanding of what is actually the problem lol
const StoreProviderOverride = StoreProvider as any;

// for some reason, typing the input object as AppProps (and also AppPropsWithLayout) returns a super-weird error
const App = ({ Component, pageProps }: any) => {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page: NextPage) => page);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={pageProps.session}>
        <ThemeProvider theme={theme}>
          <StoreProviderOverride store={globalMessageStore}>
            <>
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
              <GlobalMessageSnackbar />
            </>
          </StoreProviderOverride>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default api.withTRPC(App);
