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
    return {
      props: {
        songs,
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
