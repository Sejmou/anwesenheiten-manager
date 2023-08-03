import { Container } from '@mui/material';
import { ReactElement } from 'react';
import Header from './AdminPageHeader';
import NonAuthHeader from './NonAuthHeader';
import StreetSingingMainPageHeader from './StreetSingingMainPageHeader';

export const getAdminPageLayout = (page: ReactElement) => {
  return (
    <>
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
        {page}
      </Container>
    </>
  );
};

export const getStreetSingingPageLayout = (page: ReactElement) => {
  return (
    <>
      <StreetSingingMainPageHeader sx={{ flex: '0 1 auto' }} />
      <Container
        sx={{
          minHeight: '100%',
          flex: '1',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {page}
      </Container>
    </>
  );
};

export const getNonAuthenticatedPageLayout = (page: ReactElement) => {
  return (
    <Container
      sx={{
        minHeight: '100%',
        flex: '1',
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <NonAuthHeader />
      {page}
    </Container>
  );
};
