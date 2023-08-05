import React from 'react';
import Typography from '@mui/material/Typography';
import { NextPageWithLayout } from 'pages/_app';
import { getAdminPageLayout } from 'components/layout/get-page-layouts';
import AdminPageHead from 'components/AdminPageHead';
import { api } from 'utils/api';
import { Button } from '@mui/material';

const Songs: NextPageWithLayout = () => {
  const songQ = api.song.getAll.useQuery();
  const addSongFile = api.song.addFile.useMutation();

  // const songs = songQ?.data?.songs ?? null;

  // const handleAddClick = (songId: string) => {
  //   console.log(songId);
  //   addSongFile.mutateAsync({
  //     songId,
  //     name: 'Alle Stimmen',
  //     url: 'https://drive.google.com/uc?id=1yHpQK5tifFzxA-KeLnBa3fjQcdqoZGUb&export=download',
  //     type: 'audio',
  //   });
  // };

  // const songList = songs?.map(song => (
  //   <li key={song.id}>
  //     {song.name} ({song.files.length} File
  //     {song.files.length !== 1 ? 's' : ''})
  //     <Button onClick={() => handleAddClick(song.id)}>File hinzufügen</Button>
  //   </li>
  // ));

  return (
    <>
      <AdminPageHead title="Lieder" />
      <Typography variant="body1">
        Folgende Lieder sind in der Datenbank:
      </Typography>
      <Typography variant="body1">TODO: programmier das lol</Typography>
      {/* {songList || <Typography variant="body1">Lade Lieder...</Typography>} */}
    </>
  );
};

Songs.getLayout = getAdminPageLayout;

export default Songs;
