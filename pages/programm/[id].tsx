import React from 'react';
import { NextPageWithLayout } from '../_app';
import { getPublicPageLayout } from '../../components/layout/get-page-layouts';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { db } from 'server/db';
import {
  Card,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import PublicPageHead from 'components/PublicPageHead';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { setlist, setlistSongInfo, song, songFile } from 'drizzle/schema';
import { eq, inArray } from 'drizzle-orm';
import { Setlist, Song } from 'drizzle/models';

const SetlistSongsSpage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ setlist, songs }) => {
  return (
    <>
      <PublicPageHead title={setlist.name} />
      <Typography variant="h2" gutterBottom>
        {setlist.name}
      </Typography>
      {songs.length > 0 ? (
        <SongList songs={songs} />
      ) : (
        <Typography variant="body1">Es gibt noch keine Lieder.</Typography>
      )}
    </>
  );
};

const SongList = ({ songs }: { songs: SongsWithFiles }) => {
  return (
    <Card>
      <List>
        {songs.map(s => (
          <SongListItem key={s.id} song={s} />
        ))}
      </List>
    </Card>
  );
};

type SongWithFiles = SongsWithFiles[0];

const SongListItem = ({ song }: { song: SongWithFiles }) => {
  const audioElement = song.files.find(f => f.type === 'audio') ? (
    <audio controls src={song.files.find(f => f.type === 'audio')?.url} />
  ) : null;

  return (
    <ListItem>
      <ListItemText primary={song.name} secondary={song.description} />
      {audioElement}
      {song.files.length > 0 && (
        <Typography variant="body1">
          {song.files.map(f => f.name).join(', ')}
        </Typography>
      )}
    </ListItem>
  );
};

type SongsWithFiles = Awaited<ReturnType<typeof getSetlistSongsWithFiles>>;

type Props = {
  songs: SongsWithFiles;
  setlist: Setlist;
};

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  try {
    const dbResp = await db
      .select()
      .from(setlist)
      .where(eq(setlist.id, context.params?.id as string));
    const setlistFromDB = dbResp[0];

    if (!setlistFromDB) {
      return {
        redirect: {
          destination: '/programm',
          permanent: false,
        },
      };
    }

    const songs = await getSetlistSongsWithFiles(setlistFromDB.id);

    return {
      props: {
        setlist: setlistFromDB,
        songs,
      },
    };
  } catch (error) {
    console.error(
      'An error occurred while getting the songs from the database.',
      error
    );
    return {
      redirect: {
        destination: '/programm',
        permanent: false,
      },
    };
  }
};

SetlistSongsSpage.getLayout = getPublicPageLayout;

export default SetlistSongsSpage;

async function getSetlistSongsWithFiles(setlistId: string) {
  const songIDs = (
    await db
      .select({
        songId: song.id,
      })
      .from(setlistSongInfo)
      .leftJoin(song, eq(setlistSongInfo.songId, song.id))
      .where(eq(setlistSongInfo.setlistId, setlistId))
      .orderBy(setlistSongInfo.order)
  ).map(row => row.songId) as string[];

  const songsWithFiles = await db.query.song.findMany({
    with: {
      files: true,
    },
    where: inArray(song.id, songIDs),
  });

  // create a map of songId -> index in songIDs
  const songIdToIndex = songIDs.reduce((acc, songId, index) => {
    acc[songId] = index;
    return acc;
  }, {} as Record<string, number>);

  const emptyArray = Array(songsWithFiles.length);
  songsWithFiles.forEach(song => {
    const index = songIdToIndex[song.id]!;
    emptyArray[index] = song;
  });

  const result = emptyArray as typeof songsWithFiles;
  return result;
}
