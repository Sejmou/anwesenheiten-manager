import { NextPageWithLayout } from '../../_app';
import { getAuthenticatedPageLayout } from '../../../components/layout/get-page-layouts';
import { GetServerSideProps } from 'next';
import prisma from '../../../lib/prisma';
import { eventFromDBEvent } from '../';
import Link from 'next/link';
import {
  Button,
  Card,
  Checkbox,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Event } from '../';
import { SingerAttendance } from '../../api/attendance/[eventId]';
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { VoiceGroupToDescriptionString } from '../../../frontend-utils';
import { VoiceGroup } from '@prisma/client';
import {
  QueryFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import ResponsiveContainer from '../../../components/layout/ResponsiveContainer';
import { useState } from 'react';

type AttendanceTableColDef = GridColDef & { field: keyof SingerAttendance };

const getAttendanceTableRows: QueryFunction<SingerAttendance[]> = ({
  queryKey,
}) =>
  fetch(`/api/attendance/${queryKey[1]}`).then(
    //queryKey[1] is eventId
    data => data.json() as Promise<SingerAttendance[]>
  );

const toggleSingerAttendance = ({
  eventId,
  singerId,
}: {
  eventId: string;
  singerId: string;
}) =>
  fetch(`/api/attendance/${eventId}/${singerId}`, {
    method: 'PATCH',
  });

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
  const { data: attendances, isLoading } = useQuery(
    ['attendance', event.id],
    getAttendanceTableRows,
    {
      initialData: [],
    }
  );

  const [voiceGroupFilter, setVoiceGroupFilter] = useState<string>('');

  const voiceGroupSelect = (
    <Card
      style={{
        padding: 8,
        paddingTop: 16,
      }}
    >
      <FormControl fullWidth>
        <InputLabel id="voicegroup-select">Stimmgruppe</InputLabel>
        <Select
          labelId="voicegorup-select-label"
          id="voicegroup-select"
          value={voiceGroupFilter}
          label="Stimmgruppe"
          onChange={ev => setVoiceGroupFilter(ev.target.value as string)}
        >
          <MenuItem value="all">Alle Stimmgruppen</MenuItem>
          {Object.keys(VoiceGroup).map((val, i) => {
            return (
              <MenuItem key={i} value={val}>
                {VoiceGroupToDescriptionString[val]}
              </MenuItem>
            );
          })}
        </Select>
        <FormHelperText>Filtere nach Stimmgruppe</FormHelperText>
      </FormControl>
    </Card>
  );

  const filterModel: GridFilterModel = {
    items: [
      {
        columnField: 'voiceGroup',
        value: voiceGroupFilter === 'all' ? '' : voiceGroupFilter,
        operatorValue: 'contains',
      },
    ],
  };

  const client = useQueryClient();
  const toggleAttendanceMutation = useMutation(toggleSingerAttendance, {
    // onMutate triggers immediately on mutation (before getting any kind of response)
    onMutate: ({ singerId }) => {
      // Optimistically update to the new value
      client.setQueryData(
        ['attendance', event.id],
        (old: SingerAttendance[] | undefined) => {
          if (!old) return old;
          const newState = [...old];
          const singer = newState.find(singer => singer.id === singerId);
          if (singer) {
            singer.attending = !singer.attending;
          }
          return newState;
        }
      );
    },
    // onSettled fires when we get response, no matter if success or error; we always want to refetch
    onSettled: () => {
      client.invalidateQueries(['attendance']);
    },
  });

  const attendanceTableCols: AttendanceTableColDef[] = [
    {
      field: 'attending',
      disableColumnMenu: true,
      headerName: '',
      width: 42,
      renderCell: (params: GridRenderCellParams<boolean>) => (
        <Checkbox
          sx={{ p: 0, m: 0 }}
          checked={params.value}
          onChange={() => {
            toggleAttendanceMutation.mutate({
              eventId: event.id,
              singerId: params.id.toString(),
            });
          }}
        />
      ),
    },
    { field: 'firstName', headerName: 'Vorname', flex: 1 },
    { field: 'lastName', headerName: 'Nachname', flex: 1 },
    {
      field: 'voiceGroup',
      hide: true,
    },
  ];

  return (
    <>
      <Stack
        sx={{ direction: { xs: 'column-reverse', sm: 'row' } }}
        justifyContent="space-between"
        alignItems="center"
      >
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
      {attendances && (
        <Stack sx={{ gap: 2 }}>
          {voiceGroupSelect}
          <ResponsiveContainer title="Anwesenheiten">
            <DataGrid
              autoHeight
              columns={attendanceTableCols}
              rows={attendances}
              filterModel={filterModel}
              disableColumnFilter
              rowsPerPageOptions={[]}
            />
          </ResponsiveContainer>
        </Stack>
      )}
    </>
  );
};

EventAttendance.getLayout = getAuthenticatedPageLayout;

export default EventAttendance;
