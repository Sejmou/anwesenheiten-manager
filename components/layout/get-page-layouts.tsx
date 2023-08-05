import { Container } from '@mui/material';
import { ReactElement } from 'react';
import Header from './AdminPageHeader';
import BigAdminLogo from './BigAdminLogo';
import BigLogo from './BigLogo';

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

export const getPublicPageLayout = (page: ReactElement) => {
  return (
    <>
      <Container
        sx={{
          minHeight: '100%',
          flex: '1',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <BigLogo />
        {page}
      </Container>
    </>
  );
};

export const getAdminAuthPageLayout = (page: ReactElement) => {
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
      <BigAdminLogo />
      {page}
    </Container>
  );
};
