import React, { useState } from 'react';
import { NextPageWithLayout } from '../_app';
import { getPublicPageLayout } from '../../components/layout/get-page-layouts';
import { GetServerSideProps } from 'next';
import { db } from 'server/db';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import PublicPageHead from 'components/layout/PublicPageHead';
import BasicAccordion, { BasicAccordionItem } from 'components/BasicAccordion';
import { singularPluralAutoFormat } from 'frontend-utils';
import { SongWithFileLinks } from 'drizzle/models';
import SongDetailsDialog from 'components/SongDetailsDialog';

type PageProps = {
  setlists: Awaited<ReturnType<typeof getSetlistsWithSongs>>;
};

const SetlistsPage: NextPageWithLayout<PageProps> = ({ setlists }) => {
  const [selectedSong, setSelectedSong] = useState<SongWithFileLinks | null>(
    null
  );

  const handleSongClick = (song: SongWithFileLinks) => {
    setSelectedSong(song);
  };

  const handleSongDetailsDialogClose = () => {
    setSelectedSong(null);
  };

  return (
    <>
      <PublicPageHead title="Programm" />
      <Typography variant="h3" gutterBottom>
        Programm
      </Typography>
      {setlists.length > 0 ? (
        <BasicAccordion>
          {setlists.map(setlist => (
            <SetlistItem
              setlist={setlist}
              key={setlist.id}
              onSongClick={handleSongClick}
            />
          ))}
        </BasicAccordion>
      ) : (
        <Typography variant="body1">Es gibt noch kein Programm.</Typography>
      )}
      {selectedSong && (
        <SongDetailsDialog
          open={true} // doesn't really matter what we set this to, because we're rendering it conditionally
          onClose={handleSongDetailsDialogClose}
          song={selectedSong}
        />
      )}
    </>
  );
};

type SetlistItemProps = {
  setlist: PageProps['setlists'][0];
  onSongClick: (song: SongWithFileLinks) => void;
};

const SetlistItem = ({ setlist, onSongClick }: SetlistItemProps) => {
  const songs = setlist.setlistSongInfo.map(info => info.song);

  return (
    <BasicAccordionItem
      primaryText={setlist.name}
      secondaryText={singularPluralAutoFormat(setlist.setlistSongInfo, 'Lied')}
    >
      <List>
        {songs.map((song, i) => (
          <ListItem key={i}>
            <ListItemButton onClick={() => onSongClick(song)}>
              <ListItemText
                primary={song.name}
                secondary={getSecondaryText(song)}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </BasicAccordionItem>
  );
};

function getSecondaryText(song: SongWithFileLinks) {
  const filesStr = singularPluralAutoFormat(song.fileLinks, 'File');
  const keyStr = song.key ? `Tonart: ${song.key}` : '';
  return [keyStr, filesStr].filter(str => str !== '').join(', ');
}

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  try {
    const setlistsWithSongs = await getSetlistsWithSongs();

    return {
      props: {
        setlists: setlistsWithSongs,
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

SetlistsPage.getLayout = getPublicPageLayout;

export default SetlistsPage;

async function getSetlistsWithSongs() {
  const setlists = await db.query.setlist.findMany({
    with: {
      setlistSongInfo: {
        with: {
          song: {
            with: {
              fileLinks: true,
            },
          },
        },
        columns: {
          order: false,
        },
        orderBy: s => s.order,
      },
    },
  });

  return setlists;
}
