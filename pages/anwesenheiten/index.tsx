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
  const now = new Date();

  const events = (await prisma.event.findMany())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map(e => ({
      ...e,
      start: e.start.toLocaleString('de-AT'),
      end: e.end.toLocaleString('de-AT'),
      inPast: e.end.getTime() < now.getTime(),
      lastSyncAt: null, // we don't need that on the client
    }));

  const pastEvents = events.filter(e => e.inPast);
  const currentEvents = events.filter(e => !e.inPast);

  return {
    props: { pastEvents, currentEvents },
    revalidate: 10, // enables Incremental Static Site Generation; will trigger update of served static page content if more than 10 seconds passed since last request by some client
  };
};

type Props = { pastEvents: Event[]; currentEvents: Event[] };

const AttendanceEventOverview: NextPageWithLayout<Props> = ({
  currentEvents,
  pastEvents,
}: Props) => {
  const router = useRouter();

  const getResponsiveEventList = (events: Event[], title: string) => (
    <ResponsiveContainer sx={{ my: 1 }} title={title}>
      {events.length > 0 ? (
        <List>
          {events.map((event, i) => (
            <ListItemButton
              key={i}
              onClick={() => router.push(`anwesenheiten/${event.id}`)}
            >
              <ListItemText
                primary={`${event.summary}, ${event.start}`}
                secondary={`${event.location ?? ''}`}
              />
            </ListItemButton>
          ))}
        </List>
      ) : (
        <Typography px={2} py={1}>
          Keine Termine gefunden.
        </Typography>
      )}
    </ResponsiveContainer>
  );

  return (
    <>
      <Typography>
        Bitte wähle zuerst eine Probe/Veranstaltung für die du Anwesenheiten
        eintragen möchtest.
      </Typography>
      {currentEvents &&
        getResponsiveEventList(currentEvents, 'Aktuelle Termine')}
      {pastEvents && getResponsiveEventList(pastEvents, 'Vergangene Termine')}
    </>
  );
};

AttendanceEventOverview.getLayout = getAuthenticatedPageLayout;

export default AttendanceEventOverview;
