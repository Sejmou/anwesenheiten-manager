import React from 'react';
import { NextPageWithLayout } from './_app';
import { getStreetSingingPageLayout } from '../components/layout/get-page-layouts';
import PageHead from 'components/PageHead';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import prisma from 'lib/prisma';
import { Song } from '@prisma/client';
import { List, Typography } from '@mui/material';

type Props = {
  songs: Song[];
};

const StreetSinging: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ songs }) => {
  return (
    <>
      <PageHead title="Straßensingen" />
      <Typography variant="h3">Setlist</Typography>
      <List>
        {songs.map(song => (
          <Typography key={song.id.toString()} variant="body1">
            {song.title}
          </Typography>
        ))}
      </List>
      {songs.length == 0 && (
        <Typography variant="body1">
          Keine Songs vorhanden. Wahrscheinlich hat der Administrator verkackt.
          Gib ihm Bescheid.
        </Typography>
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  try {
    // get songs from most recently created setlist
    // TODO: figure out way for admin to choose what setlist to display
    const setlist = await prisma.setlist.findFirst({
      orderBy: {
        created_at: 'desc',
      },
      include: {
        entries: true,
      },
    });

    const setListEntries = setlist?.entries ?? [];
    // sort setListEntries by order field
    setListEntries.sort((a, b) => a.order - b.order);
    // create list of ordered song IDs from setlist entries
    const songIds = setListEntries.map(entry => entry.song_id);

    if (songIds.length === 0) {
      return {
        props: {
          songs: [],
        },
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

    const songsInSetlist = songIds.map(id => songsDict[id]);

    return {
      props: {
        songs: songsInSetlist,
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
      },
    };
  }
};

StreetSinging.getLayout = getStreetSingingPageLayout;

export default StreetSinging;
