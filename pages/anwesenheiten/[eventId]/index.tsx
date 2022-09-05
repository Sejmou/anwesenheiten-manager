import { NextPageWithLayout } from '../../_app';
import { getAuthenticatedPageLayout } from '../../../components/layout/get-page-layouts';
import { GetServerSideProps } from 'next';
import prisma from '../../../lib/prisma';
import { eventFromDBEvent } from '../';

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

const EventAttendance: NextPageWithLayout<Props> = ({}: Props) => {
  return <div>TODO: add logic for managing event attendance</div>;
};

EventAttendance.getLayout = getAuthenticatedPageLayout;

export default EventAttendance;
