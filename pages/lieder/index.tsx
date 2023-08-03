import React from 'react';
import Typography from '@mui/material/Typography';
import { NextPageWithLayout } from 'pages/_app';
import { getAdminPageLayout } from 'components/layout/get-page-layouts';
import PageHead from 'components/PageHead';

const Songs: NextPageWithLayout = () => {
  return (
    <>
      <PageHead title="Mitglieder" />
      <Typography variant="h1" component="h1" gutterBottom>
        Coming soon
      </Typography>
    </>
  );
};

Songs.getLayout = getAdminPageLayout;

export default Songs;
