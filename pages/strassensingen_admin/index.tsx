import React, { useState } from 'react';
import { NextPageWithLayout } from '../_app';
import { getAdminPageLayout } from '../../components/layout/get-page-layouts';
import PageHead from 'components/PageHead';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import prisma from 'lib/prisma';
import { Setlist, Song, SetlistSongInfo } from '@prisma/client';
import {
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  Autocomplete,
  ListItemText,
  Typography,
  TextField,
  DialogContent,
  IconButton,
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';

type Props = {
  songs: Song[];
  setlists: Setlist[];
};

const StreetSingingAdmin: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ songs, setlists }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PageHead title="Straßensingen" />
      <Typography variant="h5">Setlists</Typography>
      {setlists.length > 0 ? (
        <List>
          {setlists.map(setlist => (
            <Typography key={setlist.id} variant="body1">
              {setlist.title}
            </Typography>
          ))}
        </List>
      ) : (
        <Typography variant="body1">Keine Setlists vorhanden.</Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setDialogOpen(true)}
      >
        Neue Setlist erstellen
      </Button>
      <SetlistEditDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={async songIds => {
          console.log(songIds);
          // wait for 1 second
          await new Promise(resolve => setTimeout(resolve, 1000));
          setDialogOpen(false);
        }}
        songsToSelectFrom={songs.map(song => ({
          label: song.title,
          id: song.id,
        }))}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  try {
    const songs = await prisma.song.findMany({
      include: {
        files: true,
      },
    });
    const setlists = await prisma.setlist.findMany({
      include: {
        songs: true,
      },
    });
    return {
      props: {
        songs,
        setlists,
      },
    };
  } catch (error) {
    console.error(
      'An error occurred while getting the songs from the database.',
      error
    );
    return {
      props: {
        songs: [],
        setlists: [],
      },
    };
  }
};

StreetSingingAdmin.getLayout = getAdminPageLayout;

export default StreetSingingAdmin;

export interface SetlistEditDialogProps {
  open: boolean;
  songsToSelectFrom: { label: string | null; id: string }[];
  onSave: (songIds: string[]) => void;
  onClose: () => void;
}

function SetlistEditDialog(props: SetlistEditDialogProps) {
  const { onSave, onClose, songsToSelectFrom, open } = props;
  const [setlistSongIds, setSetlistSongIds] = React.useState<string[]>([]);

  const handleSave = () => {
    onSave(setlistSongIds);
  };

  const handleClose = () => {
    onClose();
  };

  const handleRemoveClick = (songId: string) => {
    setSetlistSongIds(setlistSongIds.filter(id => id !== songId));
  };

  const handleMoveUpClick = (songId: string) => {
    const songIndex = setlistSongIds.findIndex(id => id === songId);
    if (songIndex > 0) {
      const newSetlistData = [...setlistSongIds];
      const temp = newSetlistData[songIndex - 1];
      newSetlistData[songIndex - 1] = newSetlistData[songIndex];
      newSetlistData[songIndex] = temp;
      setSetlistSongIds(newSetlistData);
    }
  };

  console.log(setlistSongIds);

  const handleMoveDownClick = (songId: string) => {
    const songIndex = setlistSongIds.findIndex(id => id === songId);
    if (songIndex < setlistSongIds.length - 1) {
      const newSetlistData = [...setlistSongIds];
      const temp = newSetlistData[songIndex + 1];
      newSetlistData[songIndex + 1] = newSetlistData[songIndex];
      newSetlistData[songIndex] = temp;
      setSetlistSongIds(newSetlistData);
    }
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <DialogTitle>Neue Setlist</DialogTitle>
      <DialogContent>
        <Autocomplete
          sx={{ paddingTop: 1 }}
          options={songsToSelectFrom}
          renderInput={params => (
            <TextField
              {...params}
              label="Song"
              placeholder="Wähle einen Song"
              variant="outlined"
            />
          )}
          onChange={(event, value) => {
            if (value) {
              setSetlistSongIds([...setlistSongIds, value.id]);
            }
          }}
        />
        <List sx={{ pt: 0 }}>
          {setlistSongIds.map(item => (
            <ListItem disableGutters>
              <ListItemText
                primary={songsToSelectFrom.find(s => s.id == item)?.label}
              />
              <IconButton onClick={() => handleMoveUpClick(item)}>
                <ArrowUpward />
              </IconButton>
              <IconButton onClick={() => handleMoveDownClick(item)}>
                <ArrowDownward />
              </IconButton>
              <IconButton onClick={() => handleRemoveClick(item)}>
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Speichern
        </Button>
      </DialogContent>
    </Dialog>
  );
}
