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

const SetlistsPage: NextPageWithLayout<
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

const Setlists = ({ setlists }: SetlistsWithSongs) => {
  const router = useRouter();
  return (
    <Card>
      <List>
        {setlists.map(setlist => (
          <ListItem key={setlist.id}>
            <Link href={router.pathname + '/' + setlist.id}>
              <ListItemButton>
                <ListItemText
                  primary={setlist.name}
                  secondary={setlist.description}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Card>
  );
};

type SetlistsWithSongs = {
  setlists: Awaited<ReturnType<typeof getSetlists>>;
};

export const getServerSideProps: GetServerSideProps<
  SetlistsWithSongs
> = async context => {
  try {
    const setlists = await getSetlists();

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

SetlistsPage.getLayout = getPublicPageLayout;

export default SetlistsPage;

async function getSetlists() {
  const setlists = await db.query.setlist.findMany({
    orderBy: (setlist, { desc }) => desc(setlist.createdAt),
  });

  return setlists;
}
