import React from 'react';
import Typography from '@mui/material/Typography';
import { NextPageWithLayout } from 'pages/_app';
import { getAdminPageLayout } from 'components/layout/get-page-layouts';
import PageHead from 'components/PageHead';
import { api } from 'utils/trpc-api';

const Songs: NextPageWithLayout = () => {
  const hello = api.song.getAll.useQuery();

  const songs = hello?.data?.songs ?? null;

  const songList = songs?.map(song => <li key={song.id}>{song.title}</li>);

  return (
    <>
      <PageHead title="Lieder" />
      <Typography variant="body1">
        Folgende Lieder sind in der Datenbank:
      </Typography>
      {songList || <Typography variant="body1">'Lade Lieder...</Typography>}
    </>
  );
};

Songs.getLayout = getAdminPageLayout;

export default Songs;
