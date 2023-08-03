import React, { useState } from 'react';
import { NextPageWithLayout } from '../_app';
import { getAdminPageLayout } from '../../components/layout/get-page-layouts';
import PageHead from 'components/PageHead';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import prisma from 'lib/prisma';
import { Setlist, Song, SetlistSongInfo } from '@prisma/client';
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import SetlistDialog from 'components/SetlistDialog';

type Props = {
  songs: Song[];
  setlists: Array<Setlist & { entries: SetlistSongInfo[] }>;
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
            <ListItem key={setlist.id}>
              <ListItemText
                primary={setlist.title}
                secondary={
                  `${setlist.entries.length} Lieder, erstellt: ` +
                  setlist.created_at?.toLocaleString()
                }
              />
            </ListItem>

            // TODO: make setlists editable/deletable
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
      <SetlistDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={async songIds => {
          const response = await fetch('/api/setlist', {
            method: 'POST',
            body: JSON.stringify({
              title: 'Neue Setlist', // TODO: make this editable in UI
              songIds,
            }),
          });
          if (response.ok) {
            const newSetlist = await response.json();
            setlists.push(newSetlist);
          }
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
