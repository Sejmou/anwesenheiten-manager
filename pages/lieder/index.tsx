import React from 'react';
import Typography from '@mui/material/Typography';
import { NextPageWithLayout } from 'pages/_app';
import { getAdminPageLayout } from 'components/layout/get-page-layouts';
import AdminPageHead from 'components/AdminPageHead';
import { api } from 'utils/api';
import {
  Button,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';
import { SongFile } from 'drizzle/models';

const Songs: NextPageWithLayout = () => {
  const songQ = api.song.getAll.useQuery();
  const addSongFile = api.song.addOrUpdateFile.useMutation();

  const songs = songQ?.data?.songs ?? null;

  const handleAddClick = async (file: SongFile) => {
    console.log(file);
    const fileFromDB = await addSongFile.mutateAsync(file);
    console.log(fileFromDB);
  };

  const songListItems = songs?.map(song => (
    <ListItem key={song.id}>
      <ListItemText
        primary={song.name}
        secondary={song.createdAt.toLocaleDateString()}
      />
      <ListItemSecondaryAction>
        <Button
          variant="contained"
          color="primary"
          onClick={() =>
            handleAddClick({
              songId: song.id,
              name: song.name,
              type: 'video',
              url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
            })
          }
        >
          Hinzufügen
        </Button>
      </ListItemSecondaryAction>
    </ListItem>
  ));

  return (
    <>
      <AdminPageHead title="Lieder" />
      <Typography variant="body1">
        Folgende Lieder sind in der Datenbank:
      </Typography>
      {songListItems ? (
        <List>{songListItems}</List>
      ) : (
        <Typography variant="body1">Lade Lieder...</Typography>
      )}
    </>
  );
};

Songs.getLayout = getAdminPageLayout;

export default Songs;
