import React from 'react';
import { NextPageWithLayout } from './_app';
import { getPublicPageLayout } from '../components/layout/get-page-layouts';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import prisma from 'lib/prisma';
import type { Setlist, SetlistSongInfo, Song } from '@prisma/client';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PublicPageHead from 'components/PublicPageHead';

type SetlistWithSongs = {
  name: string;
  songs: Song[];
};

type Props = {
  setlists: SetlistWithSongs[];
};

const StreetSinging: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ setlists }) => {
  return (
    <>
      <PublicPageHead title="Programm" />
      <Typography variant="h2" gutterBottom>
        Programm
      </Typography>
      {setlists.length > 0 ? (
        <Setlists setlists={setlists} />
      ) : (
        <Typography variant="body1">Es gibt noch kein Programm.</Typography>
      )}
    </>
  );
};

const Setlists = ({ setlists }: Props) => {
  return (
    <div>
      {setlists.map(setlist => (
        <Accordion key={setlist.name}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{setlist.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {setlist.songs.map(song => (
                <ListItem key={song.id}>
                  <ListItemText primary={song.name} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  try {
    const setlists = await getSetlistsWithSongs();

    return {
      props: {
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
        setlists: [],
      },
    };
  }
};

StreetSinging.getLayout = getPublicPageLayout;

export default StreetSinging;

async function getSetlistsWithSongs(): Promise<SetlistWithSongs[]> {
  const dbResult = await prisma.setlist.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      entries: true,
    },
  });

  const setlists = await Promise.all(dbResult.map(r => getSetlistSongs(r)));

  return setlists;
}

async function getSetlistSongs(
  setlist: Setlist & { entries: SetlistSongInfo[] }
): Promise<SetlistWithSongs> {
  const setListEntries = setlist?.entries ?? [];
  // sort setListEntries by order field
  setListEntries.sort((a, b) => a.order - b.order);
  // create list of ordered song IDs from setlist entries
  const songIds = setListEntries.map(entry => entry.songId);

  if (songIds.length === 0) {
    return {
      name: setlist.name,
      songs: [],
    };
  }

  const songs = await prisma.song.findMany({
    where: {
      id: {
        in: songIds,
      },
    },
  });

  // convert list to dictionary with song id as key
  // using this approach as having the same song in the setlist multiple times is explicitly allowed!
  const songsDict = songs.reduce((dict, song) => {
    dict[song.id] = song;
    return dict;
  }, {} as { [id: string]: Song });

  const songsInSetlist = songIds.map(id => songsDict[id]!);

  return {
    name: setlist.name,
    songs: songsInSetlist,
  };
}
