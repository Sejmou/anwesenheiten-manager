import { Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Event as EventDB,
  EventAttendance,
  Singer as SingerDB,
  VoiceGroup,
} from '@prisma/client';
import PageHead from 'components/PageHead';
import { voiceGroupGridValueFormatter } from 'frontend-utils';
import prisma from 'lib/prisma';
import { GetStaticProps } from 'next';
import { eventFromDBEvent } from '../anwesenheiten';
import { getAdminPageLayout } from 'components/layout/get-page-layouts';
import ResponsiveContainer from 'components/layout/ResponsiveContainer';
import { NextPageWithLayout } from 'pages/_app';

type Singer = Omit<SingerDB, 'createdAt'>;
type Event = Omit<EventDB, 'lastSyncAt' | 'start' | 'end'> & {
  start: string;
  end: string;
};

type Props = {
  data: EventAttendance[];
  attendedEvents: Event[];
  singersWithAttendance: Singer[];
  allSingers: Singer[];
  totalSingers: number;
  singersByVoiceGroup: { [voiceGroup: string]: number };
};
const Stats: NextPageWithLayout<Props> = ({
  data,
  attendedEvents: events,
  singersWithAttendance: singers,
  singersByVoiceGroup,
  allSingers,
}) => {
  const attendanceByEvent: {
    singers: Singer[];
    event: Event;
    total: number;
  }[] = events.map(event => {
    const singerIds = data
      .filter(d => d.eventId === event.id)
      .map(d => d.singerId);
    const eventSingers = singers.filter(s => singerIds.includes(s.id));
    const total = eventSingers.length;
    return { event, singers: eventSingers, total };
  });

  const attendanceBySinger: {
    singer: Singer;
    events: Event[];
    total: number;
  }[] = singers.map(singer => {
    const eventIds = data
      .filter(d => d.singerId === singer.id)
      .map(d => d.eventId);
    const singerEvents = events.filter(e => eventIds.includes(e.id));
    const total = singerEvents.length;
    return { singer, events: singerEvents, total };
  });

  const voiceGroups = Array.from(Object.keys(VoiceGroup)) as VoiceGroup[];

  const eventAttendanceByVoiceGroup = attendanceByEvent.map(ea =>
    voiceGroups.map(vg => ({
      singers: ea.singers.filter(s => s.voiceGroup === vg),
      voiceGroup: vg,
    }))
  );

  const eventAttendanceRows = attendanceByEvent.map(obj => ({
    count: obj.total,
    start: obj.event.start,
    summary: obj.event.summary,
    id: obj.event.id,
  }));

  const singersByVoiceGroupRows = Object.entries(singersByVoiceGroup).map(
    ([voiceGroup, count], id) => ({ voiceGroup, count, id })
  );

  const singersAttendanceRows = allSingers.map(s => {
    const attendanceCount =
      attendanceBySinger.find(obj => obj.singer.id === s.id)?.total ?? 0;
    const absenceCount = events.length - attendanceCount;
    const { firstName, lastName, voiceGroup } = s;
    return { firstName, lastName, voiceGroup, absenceCount, id: s.id };
  });

  return (
    <>
      <PageHead title="Statistiken" />
      <Stack>
        <Typography>
          Hier werden verschiedene Statistiken über den Chor und die
          Probenanwesenheiten gesammelt.
        </Typography>
        <Stack>
          <Typography variant="h3">Probenanwesenheiten</Typography>
          <Typography>
            Insgesamt gab es bisher {events.length} Proben, für die
            Anwesenheiten eingetragen wurden.
          </Typography>
          <Stack spacing={{ md: 1 }}>
            <ResponsiveContainer
              title="Fehlproben-Übersicht"
              heightEqualsMaxHeight
            >
              <DataGrid
                columns={[
                  { field: 'firstName', headerName: 'Vorname', flex: 1 },
                  { field: 'lastName', headerName: 'Nachname', flex: 1 },
                  {
                    field: 'voiceGroup',
                    headerName: 'Stimmgruppe',
                    valueFormatter: voiceGroupGridValueFormatter,
                    flex: 1,
                  },
                  { field: 'absenceCount', headerName: 'Fehlproben', flex: 1 },
                ]}
                rows={singersAttendanceRows}
                hideFooter
              />
            </ResponsiveContainer>
            <ResponsiveContainer title="Anwesenheiten" heightEqualsMaxHeight>
              <DataGrid
                columns={[
                  { field: 'summary', headerName: 'Termin', flex: 1 },
                  { field: 'start', headerName: 'Datum', flex: 1 },
                  { field: 'count', headerName: 'Anwesend', flex: 0.5 },
                ]}
                rows={eventAttendanceRows}
                hideFooter
              />
            </ResponsiveContainer>
          </Stack>
          <Typography variant="h3" mt={2}>
            Allgemeines
          </Typography>
          <ResponsiveContainer title="SängerInnen nach Stimmgruppen">
            <DataGrid
              autoHeight
              columns={[
                {
                  field: 'voiceGroup',
                  headerName: 'Stimmgruppe',
                  valueFormatter: voiceGroupGridValueFormatter,
                  flex: 1,
                },
                { field: 'count', headerName: '# SängerInnen', flex: 1 },
              ]}
              rows={singersByVoiceGroupRows}
              hideFooter
            />
          </ResponsiveContainer>
        </Stack>
      </Stack>
    </>
  );
};

Stats.getLayout = getAdminPageLayout;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const attendanceData = await prisma.eventAttendance.findMany();
  // TODO: refactor this mess to just use some SQL lol
  // why was I doing this, it truly is ridiculous
  const events = (
    await prisma.eventAttendance.findMany({
      select: { event: true },
      distinct: ['eventId'],
    })
  )
    .map(obj => obj.event)
    .map(eventFromDBEvent);
  const singers = (
    await prisma.eventAttendance.findMany({
      select: { singer: true },
      distinct: ['singerId'],
    })
  )
    .map(obj => obj.singer)
    .map(s => ({ ...s, createdAt: null }));

  const totalSingers = await prisma.singer.count();
  const singersByVoiceGroupObjs = (
    await prisma.singer.groupBy({
      by: ['voiceGroup'],
      _count: { _all: true },
    })
  ).map(obj => ({ [obj.voiceGroup]: obj._count._all }));

  const singersByVoiceGroup: { [group: string]: number } = {};
  singersByVoiceGroupObjs.forEach(obj => {
    const group = Object.keys(obj)[0]!;
    const count = obj[group]!;
    singersByVoiceGroup[group] = count;
  });

  const allSingers = (await prisma.singer.findMany()).map(s => ({
    ...s,
    createdAt: null,
  }));

  return {
    props: {
      data: attendanceData,
      attendedEvents: events,
      singersWithAttendance: singers,
      totalSingers,
      singersByVoiceGroup,
      allSingers,
    },
    revalidate: 60, // enables Incremental Static Site Generation; will trigger update of served static page content if more than 10 seconds passed since last request by some client
  };
};

export default Stats;
