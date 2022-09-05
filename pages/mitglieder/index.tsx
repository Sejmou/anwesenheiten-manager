import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import { NextPageWithLayout } from '../_app';
import { getAuthenticatedPageLayout } from '../../components/layout/get-page-layouts';
import CustomDropzone from '../../components/CustomDropzone';
import Papa from 'papaparse';
import { Button, Stack } from '@mui/material';
import { VoiceGroup } from '@prisma/client';
import {
  DataGrid,
  GridColDef,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import ResponsiveContainer from '../../components/layout/ResponsiveContainer';
import { NewSinger, Singer } from '../api/singers';
import { VoiceGroupToDescriptionString } from '../../frontend-utils';
import {
  QueryFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

const parsePromise = function (file: File, header: boolean) {
  return new Promise(function (complete, error) {
    Papa.parse(file, { header, complete, error });
  });
};

const csvVoiceGroupToDBVoiceGroup: { [csvGroup: string]: VoiceGroup } = {
  S1: 'S1',
  S2: 'S2',
  ['S2/M']: 'S2_M',
  ['A1/M']: 'A1_M',
  A1: 'A1',
  A2: 'A2',
  T1: 'T1',
  T2: 'T2',
  B1: 'B1',
  B2: 'B2',
  D: 'D',
};

type SingerTableColDef = GridColDef & { field: keyof Singer };

const singerTableCols: SingerTableColDef[] = [
  { field: 'firstName', headerName: 'Vorname', flex: 1 },
  { field: 'lastName', headerName: 'Nachname', flex: 1 },
  {
    field: 'voiceGroup',
    headerName: 'Stimmgruppe',
    flex: 1,
    valueFormatter: (params: GridValueFormatterParams<VoiceGroup>) => {
      if (!params.value) return '-';
      return VoiceGroupToDescriptionString[params.value] ?? '-';
    },
  },
];

const getDBSingers: QueryFunction<Singer[]> = () =>
  fetch('/api/singers').then(data => data.json() as Promise<Singer[]>);

const addSingers = (singers: NewSinger[]) =>
  fetch('/api/singers', {
    method: 'POST',
    body: JSON.stringify(singers),
  });

const Members: NextPageWithLayout = () => {
  const [importedSingerTableRows, setImportedSingerTableRows] = useState<
    NewSinger[]
  >([]);

  const handleFiles = async (files: File[]) => {
    console.log(files);
    const { data } = (await parsePromise(files[0], true)) as {
      data: { [key: string]: string }[];
    };
    const importedSingers: Singer[] = data
      .map(row => ({
        Stimmgruppe: row.Stimmgruppe,
        Vorname: row.Vorname,
        Nachname: row.Nachname,
      }))
      .filter(row => !!row.Stimmgruppe && !!row.Vorname && !!row.Nachname)
      .map((row, i) => ({
        firstName: row.Vorname,
        lastName: row.Nachname,
        voiceGroup: csvVoiceGroupToDBVoiceGroup[row.Stimmgruppe],
        id: i.toString(),
      }))
      .filter(row => !!row.voiceGroup);

    setImportedSingerTableRows(importedSingers);
  };

  const { data: singers, isLoading: singersLoading } = useQuery<Singer[]>(
    ['singers'],
    getDBSingers,
    {
      initialData: [],
    }
  );

  const client = useQueryClient();

  const singersMutation = useMutation(addSingers, {
    onSuccess: () => {
      setCsvDataImported(true);
      setImportedSingerTableRows([]);
      client.invalidateQueries(['singers']);
    },
  });

  const importConfirmHandler = () => {
    singersMutation.mutate(importedSingerTableRows);
  };

  const [csvDataImported, setCsvDataImported] = useState(false);

  return (
    <Stack spacing={1}>
      <Stack mt={2} spacing={{ xs: 0, md: 2 }}>
        {singersLoading ? (
          'Lade Sänger:innen-Liste...'
        ) : singers.length === 0 ? (
          <Stack>
            <Typography variant="h4">Chor-Mitglieder</Typography>
            <Typography>
              Aktuell sind noch keine Mitglieder in der Datenbank eingetragen.
            </Typography>
          </Stack>
        ) : (
          <ResponsiveContainer title="Chor-Mitglieder">
            <DataGrid
              autoHeight
              columns={singerTableCols}
              rows={singers}
              hideFooter
            />
          </ResponsiveContainer>
        )}
        <Stack>
          <Typography variant="h4">CSV-Import</Typography>
          {csvDataImported ? (
            <Stack>
              <Typography>Daten erfolgreich importiert!</Typography>
              <Stack alignItems="center">
                <Button
                  variant="contained"
                  onClick={() => setCsvDataImported(false)}
                >
                  Weitere Daten importieren
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Stack>
                <Typography>
                  Hier kann ein CSV-File mit den Namen und Stimmgruppen aller
                  Chormitglieder hochgeladen werden.
                </Typography>
                <Typography>
                  Das CSV muss 3 Spalten (Vorname, Nachname, Stimmgruppe),
                  getrennt durch Kommas enthalten.
                </Typography>
                <Typography mt={1}>
                  Für die Stimmgruppen-Spalte werden nur folgende Werte
                  akzeptiert:
                </Typography>
                <ul>
                  {[
                    ['S1', 'Sopran 1'],
                    ['S2', 'Sopran 2'],
                    ['S2/M', 'Sopran 2/Mezzo'],
                    ['A1', 'Alt 1'],
                    ['A1/M', 'Alt 1/Mezzo'],
                    ['A2', 'Alt 2'],
                    ['T1', 'Tenor 1'],
                    ['T2', 'Tenor 2'],
                    ['B1', 'Bass 1'],
                    ['B2', 'Bass 2'],
                    ['D', 'Dirigent'],
                  ].map((row, i) => (
                    <li key={i}>
                      {row[0]} ({row[1]})
                    </li>
                  ))}
                </ul>
                <Typography>
                  Zeilen mit fehlendem Vor-/Nachnamen oder ungültiger
                  Stimmgruppe werden herausgefiltert.
                </Typography>
              </Stack>
              {importedSingerTableRows.length === 0 ? (
                <CustomDropzone
                  text="CSV hochladen (hier klicken oder hineinziehen)"
                  dragText="Einfach loslassen :)"
                  fileTypesAndExtensions={{ 'text/csv': ['.csv'] }}
                  onFilesAdded={handleFiles}
                />
              ) : (
                <>
                  <ResponsiveContainer
                    title="Importierte Zeilen"
                    contentWrapperSx={{ height: 300 }}
                  >
                    <DataGrid
                      columns={singerTableCols}
                      rows={importedSingerTableRows}
                      hideFooter
                    />
                  </ResponsiveContainer>
                  <Stack alignItems="center">
                    <Typography>
                      Es wurden {importedSingerTableRows.length} Zeilen
                      importiert.
                    </Typography>
                    <Typography>
                      Stimmen die Daten? Wenn ja, dann einfach
                    </Typography>
                    <Stack alignItems="center" my={1}>
                      <Button
                        variant="contained"
                        onClick={importConfirmHandler}
                      >
                        Bestätigen
                      </Button>
                    </Stack>
                    <Typography textAlign="center" variant="body2">
                      (Mit Klick auf den Button werden die Daten in die
                      Datenbank geschrieben.)
                    </Typography>
                  </Stack>
                </>
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

Members.getLayout = getAuthenticatedPageLayout;

export default Members;
