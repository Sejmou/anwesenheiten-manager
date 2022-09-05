import { NextPageWithLayout } from '../../_app';
import { getAuthenticatedPageLayout } from '../../../components/layout/get-page-layouts';
import { GetServerSideProps } from 'next';
import prisma from '../../../lib/prisma';
import { eventFromDBEvent } from '../';
import Link from 'next/link';
import { Button, Stack, Typography } from '@mui/material';
import { Event } from '../';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const redirect = {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };

  const eventId = params?.eventId;
  if (!eventId || typeof eventId !== 'string') {
    return redirect;
  }

  const dbEvent = await prisma.event.findFirst({ where: { id: eventId } });
  if (!dbEvent) {
    return redirect;
  }

  return {
    props: { event: eventFromDBEvent(dbEvent) },
  };
};

type Props = { event: Event };

const EventAttendance: NextPageWithLayout<Props> = ({ event }: Props) => {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack>
        <Typography variant="h4">{event.summary}</Typography>
        <Typography variant="subtitle1">{`${
          event.location ? event.location + ', ' : ''
        }${event.start}`}</Typography>
      </Stack>
      <Button>
        <Link href="/anwesenheiten">Zurück zur Termin-Übersicht</Link>
      </Button>
    </Stack>
  );
};

EventAttendance.getLayout = getAuthenticatedPageLayout;

export default EventAttendance;
