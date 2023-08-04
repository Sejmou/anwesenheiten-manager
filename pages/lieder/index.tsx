import React from 'react';
import Typography from '@mui/material/Typography';
import { NextPageWithLayout } from 'pages/_app';
import { getAdminPageLayout } from 'components/layout/get-page-layouts';
import PageHead from 'components/PageHead';
import { trpc } from 'utils/trpc';

const Songs: NextPageWithLayout = () => {
  const hello = trpc.hello.useQuery({ name: 'client' });

  return (
    <>
      <PageHead title="Lieder" />
      <Typography variant="h1" component="h1" gutterBottom>
        Coming soon
      </Typography>
      <Typography variant="body1">
        {hello?.data?.greeting ?? 'Loading...'}
      </Typography>
    </>
  );
};

Songs.getLayout = getAdminPageLayout;

export default Songs;
