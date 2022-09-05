import React from 'react';
import Typography from '@mui/material/Typography';
import { NextPageWithLayout } from '../_app';
import { getAuthenticatedPageLayout } from '../../components/layout/get-page-layouts';
import { GetStaticProps } from 'next';
import ResponsiveContainer from '../../components/layout/ResponsiveContainer';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { useRouter } from 'next/router';
import prisma from '../../lib/prisma';
import { Event as EventDB } from '@prisma/client';

type Event = Omit<EventDB, 'start' | 'end' | 'lastSyncAt'> & {
  start: string;
  end: string;
};

export const getStaticProps: GetStaticProps = async () => {
  const events = (await prisma.event.findMany()).map(e => ({
    ...e,
    start: e.start.toLocaleString('de-AT'),
    end: e.end.toLocaleString('de-AT'),
    lastSyncAt: null, // we don't need that on the client
  }));

  return {
    props: { events },
    revalidate: 10, // enables Incremental Static Site Generation; will trigger update of served static page content if more than 10 seconds passed since last request by some client
  };
};

type Props = { events: Event[] };

const AttendanceEventOverview: NextPageWithLayout<Props> = ({
  events,
}: Props) => {
  const router = useRouter();

  return (
    <>
      <Typography>
        Bitte wähle zuerst eine Probe/Veranstaltung für die du Anwesenheiten
        eintragen möchtest.
      </Typography>
      <ResponsiveContainer title="Termine">
        <List>
          {events.map((event, i) => (
            <ListItemButton
              key={i}
              onClick={() => router.push(`anwesenheiten/${event.id}`)}
            >
              <ListItemText
                primary={`${event.summary}, ${event.start}`}
                secondary={`${event.location}`}
              />
            </ListItemButton>
          ))}
        </List>
      </ResponsiveContainer>
    </>
  );
};

AttendanceEventOverview.getLayout = getAuthenticatedPageLayout;

export default AttendanceEventOverview;
