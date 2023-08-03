import { Link, Stack, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import { Event } from '@prisma/client';
import {
  QueryFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import PageHead from 'components/PageHead';
import { useState } from 'react';
import { getAdminPageLayout } from 'components/layout/get-page-layouts';
import ResponsiveContainer from 'components/layout/ResponsiveContainer';
import { NextPageWithLayout } from 'pages/_app';

const syncWithGoogleCalendar = () => fetch('/api/calendar/sync');
const getEvents: QueryFunction<Event[]> = () =>
  fetch('/api/calendar').then(data => data.json() as Promise<Event[]>);

type EventTableColDef = GridColDef & { field: keyof Event };

const dateStringFormatter: (
  params: GridValueFormatterParams<Date>
) => string = params => {
  if (!params.value) return '-';
  const date = new Date(params.value);
  return date.toLocaleString('de-AT');
};

const eventTableCols: EventTableColDef[] = [
  { field: 'summary', headerName: 'Termin', flex: 2 },
  { field: 'location', headerName: 'Ort', flex: 1 },
  {
    field: 'start',
    headerName: 'Beginn',
    flex: 1,
    valueFormatter: dateStringFormatter,
  },
  {
    field: 'end',
    headerName: 'Ende',
    flex: 1,
    valueFormatter: dateStringFormatter,
  },
];

type Props = {};
const Calendar: NextPageWithLayout<Props> = () => {
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>(
    ['events'],
    getEvents,
    {
      initialData: [],
    }
  );

  const client = useQueryClient();

  const calendarSyncMutation = useMutation(syncWithGoogleCalendar, {
    onSuccess: () => {
      client.invalidateQueries(['events']);
    },
  });

  const { isLoading: syncInProgress } = calendarSyncMutation;

  const lastSync = events?.[0]?.lastSyncAt;

  // needed to make sure events are sorted in ascending order per default
  const [eventSortModel, setEventSortModel] = useState<GridSortModel>([
    {
      field: 'start',
      sort: 'asc',
    },
  ]);

  return (
    <>
      <PageHead title="Terminkalender" />
      {eventsLoading ? (
        'Lade Termine'
      ) : events.length > 0 ? (
        <ResponsiveContainer title="Termine" heightEqualsMaxHeight>
          <DataGrid
            columns={eventTableCols}
            rows={events}
            sortModel={eventSortModel}
            onSortModelChange={newModel => setEventSortModel(newModel)}
          />
        </ResponsiveContainer>
      ) : (
        ''
      )}
      <Stack my={2} spacing={1}>
        <Typography>
          Das TU-Chor-Admin-Dashboard verwendet Termine aus dem öffentlichen{' '}
          <Link
            href="https://calendar.google.com/calendar/embed?src=qshfu0pshf6u7emr0f7pn80a3c%40group.calendar.google.com&ctz=Europe%2FVienna"
            target="_blank"
          >
            TU-Chor-Kalender
          </Link>
          .
        </Typography>
        <Stack>
          <Typography>
            Letzte Synchronisierung mit Google Kalender:{' '}
            {!eventsLoading
              ? lastSync
                ? new Date(lastSync).toLocaleString('de-AT')
                : 'Noch nicht synchronisiert!'
              : 'Synchronisiere...'}
          </Typography>
          {lastSync && (
            <Typography>
              Haben sich seitdem Termine im Google Kalender geändert? Wenn ja,
              dann bitte...
            </Typography>
          )}
        </Stack>
        <Stack my={1} alignItems="center">
          <LoadingButton
            variant="contained"
            onClick={() => calendarSyncMutation.mutate()}
            loading={syncInProgress}
          >
            Mit Google Kalender synchronisieren
          </LoadingButton>
        </Stack>
      </Stack>
    </>
  );
};

Calendar.getLayout = getAdminPageLayout;

export default Calendar;
