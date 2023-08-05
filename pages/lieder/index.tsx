import { useMemo, useState } from 'react';
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
import { AttachFile } from '@mui/icons-material';
import SongFilesDialog from 'components/SongFilesDialog';

const Songs: NextPageWithLayout = () => {
  const songQ = api.song.getAll.useQuery();
  const updateSongFiles = api.song.updateFiles.useMutation();

  const songs = songQ?.data?.songs ?? [];

  const [fileEditDialogOpen, setDialogOpen] = useState(false);
  const [song, setSong] = useState<(typeof songs)[0] | null>(null);

  const handleFilesSave = async (files: SongFile[], songId: string) => {
    console.log(files);
    const update = await updateSongFiles.mutateAsync({
      files,
      songId,
    });
    const song = songs?.find(s => s.id === update.songId);
    if (song) {
      song.files = update.files;
    } else {
      console.warn('Song not found, cannot update files received from server');
    }
    setDialogOpen(false);
  };

  const handleFileEditClick = (song: (typeof songs)[0]) => {
    setSong(song);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
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
          startIcon={<AttachFile />}
          onClick={() => handleFileEditClick(song)}
        >
          {song.files.length} Verlinkte{song.files.length == 1 ? 's' : ''} File
          {song.files.length !== 1 ? 's' : ''}
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
      {song && (
        <SongFilesDialog
          open={fileEditDialogOpen}
          key={song.id} // force re=render if song changes
          files={song.files}
          songId={song.id}
          songName={song.name}
          onSave={files => handleFilesSave(files, song.id)}
          onClose={handleDialogClose}
        />
      )}
    </>
  );
};

Songs.getLayout = getAdminPageLayout;

export default Songs;
