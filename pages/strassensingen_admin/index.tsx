import React, { useMemo, useState } from 'react';
import { NextPageWithLayout } from '../_app';
import { getAdminPageLayout } from '../../components/layout/get-page-layouts';
import PageHead from 'components/PageHead';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import prisma from 'lib/prisma';
import { Setlist, Song, SetlistSongInfo } from '@prisma/client';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import SetlistDialog, {
  SetlistDialogFormValues,
} from 'components/SetlistDialog';
import Delete from '@mui/icons-material/Delete';

type Props = {
  songs: Song[];
  setlists: Array<Setlist & { entries: SetlistSongInfo[] }>;
};

const StreetSingingAdmin: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ songs, setlists: initialSetlists }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [setlists, setSetlists] = useState(initialSetlists);

  const [editedSetlistId, setEditedSetlistId] = useState<string | null>(null);

  const initialDialogValues = useMemo(() => {
    if (editedSetlistId) {
      const setlist = setlists.find(setlist => setlist.id === editedSetlistId);
      if (!setlist) {
        console.warn(
          `Could not find setlist with id ${editedSetlistId} in setlists array.`
        );
        return null;
      }
      const formValues: SetlistDialogFormValues = {
        title: setlist.title!, // TODO: update model to make title non-nullable
        songIds: setlist.entries.map(entry => entry.song_id),
      };
      return formValues;
    } else {
      return null;
    }
  }, [editedSetlistId]);

  const handleSetlistClick = (id: string) => {
    setEditedSetlistId(id);
    setDialogOpen(true);
  };

  const handleNewSetlistClick = () => {
    setEditedSetlistId(null);
    setDialogOpen(true);
  };

  const handleSetlistRemove = async (id: string) => {
    const response = await fetch(`/api/setlist/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      const deletedSetlist = await response.json();
      const setlistIndex = setlists.findIndex(
        setlist => setlist.id === deletedSetlist.id
      );
      if (setlistIndex === -1) {
        console.warn(
          `Could not find setlist with id ${deletedSetlist.id} in setlists array.`
        );
        return;
      }
      setSetlists(setlists.filter(setlist => setlist.id !== deletedSetlist.id));
    }
  };

  const handleDialogSave = async (payload: SetlistDialogFormValues) => {
    if (!editedSetlistId) {
      // create new setlist
      const response = await fetch('/api/setlist', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const newSetlist = await response.json();
        setlists.push(newSetlist);
        setDialogOpen(false);
      }
    } else {
      // update existing setlist
      const response = await fetch(`/api/setlist/${editedSetlistId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const updatedSetlist = await response.json();
        const setlistIndex = setlists.findIndex(
          setlist => setlist.id === updatedSetlist.id
        );
        if (setlistIndex === -1) {
          console.warn(
            `Could not find setlist with id ${updatedSetlist.id} in setlists array.`
          );
          return;
        }
        setSetlists(updatedSetlist);
        setDialogOpen(false);
      }
    }
  };

  return (
    <>
      <PageHead title="Straßensingen" />
      <Typography variant="h5">Setlists</Typography>
      {setlists.length > 0 ? (
        <List>
          {setlists.map(setlist => (
            <ListItem key={setlist.id}>
              <ListItemButton onClick={() => handleSetlistClick(setlist.id)}>
                <ListItemText
                  primary={setlist.title}
                  secondary={
                    `${setlist.entries.length} Lieder, erstellt: ` +
                    setlist.created_at?.toLocaleString()
                  }
                />
                <IconButton
                  onClick={ev => {
                    ev.stopPropagation(); // otherwise the list item would be clicked as well, triggering the dialog
                    handleSetlistRemove(setlist.id);
                  }}
                >
                  <Delete />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body1">Keine Setlists vorhanden.</Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={handleNewSetlistClick}
      >
        Neue Setlist erstellen
      </Button>
      <SetlistDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleDialogSave}
        songsToSelectFrom={songs.map(song => ({
          label: song.title,
          id: song.id,
        }))}
        initialValues={initialDialogValues}
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
        entries: true,
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
