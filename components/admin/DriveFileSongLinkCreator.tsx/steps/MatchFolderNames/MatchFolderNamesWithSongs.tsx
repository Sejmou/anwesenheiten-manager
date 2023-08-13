import {
  Alert,
  Autocomplete,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { FieldArray, Formik } from 'formik';
import { RouterOutputs, api } from 'utils/api';
import { FolderToSongMapping, useLinkCreatorStore } from '../../store';
import { db } from 'server/db';
import { use, useEffect, useState } from 'react';

type Props = {
  folderId: string;
};

type Song = RouterOutputs['song']['getAll'][0];

const MatchFolderNamesWithSongs = ({ folderId }: Props) => {
  const getMappings =
    api.googleDrive.getSongMappingsForSubfolderNames.useQuery(folderId);
  const getSongs = api.song.getAll.useQuery();
  const handleMappingsChange = useLinkCreatorStore(
    state => state.handleMappingsChange
  );

  const songs = getSongs.data ?? [];
  const dbMappings = getMappings.data ?? [];
  const userMappings = useLinkCreatorStore(state => state.mappings);
  const mappings = userMappings ?? dbMappings;

  const loadingData = getMappings.isLoading || getSongs.isLoading;
  const error = getMappings.error || getSongs.error;

  const mappingsChangedByUser = !arraysEqual(dbMappings, mappings);
  const handleResetClick = () => {
    handleMappingsChange(dbMappings);
    setRerenderHackKey(rerenderHackKey + 1);
  };
  const [rerenderHackKey, setRerenderHackKey] = useState(0); // hack to reset form on reset click - TODO: find better solution

  if (error)
    return <Typography color="error">Fehler beim Laden der Daten</Typography>;
  if (loadingData) return <Typography>Lade Daten...</Typography>;

  return (
    <>
      {mappingsChangedByUser && (
        <Alert
          severity="info"
          action={
            <Button size="small" onClick={handleResetClick}>
              Zurücksetzen
            </Button>
          }
        >
          Die Zuordnung wurde von dir geändert.{' '}
        </Alert>
      )}
      <NameMappingForm
        key={rerenderHackKey}
        initialMappings={mappings}
        songs={songs}
        onChange={handleMappingsChange}
      />
    </>
  );
};

function arraysEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((item, index) => {
    return JSON.stringify(item) === JSON.stringify(arr2[index]);
  });
}

export default MatchFolderNamesWithSongs;

type NameMatchFormProps = {
  initialMappings: FolderToSongMapping[];
  songs: Song[];
  onChange: (mappings: FolderToSongMapping[]) => void;
};

const NameMappingForm = ({
  initialMappings,
  songs,
  onChange,
}: NameMatchFormProps) => {
  useEffect(() => {
    // required to make sure values are written to store also if user decides to make no changes at all
    onChange(initialMappings);
  }, []);

  return (
    <TableContainer component={Paper}>
      <Formik
        initialValues={{
          matches: initialMappings,
        }}
        validate={values => {
          // 'abusing validate callback to store changes
          onChange(values.matches);
        }}
        onSubmit={() => {
          // won't do anything here, but TS complains if we don't add a handler
        }}
      >
        {({ values, setFieldValue }) => (
          <form>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ordner</TableCell>
                  <TableCell>Lied</TableCell>
                </TableRow>
              </TableHead>
              <FieldArray name="matches">
                <TableBody>
                  {values.matches.map((match, index) => {
                    return (
                      <TableRow key={match.folderId}>
                        <TableCell>{match.folderName}</TableCell>
                        <TableCell
                          sx={{
                            py: 1,
                          }}
                        >
                          <Autocomplete
                            options={songs}
                            getOptionLabel={song => song.name}
                            sx={{ minWidth: 300 }}
                            renderInput={params => (
                              <TextField
                                {...params}
                                label={
                                  params.inputProps.value
                                    ? 'Verlinktes Lied'
                                    : 'Kein Lied verlinkt'
                                }
                                placeholder="Wähle ein Lied aus dem Repertoire"
                                variant="outlined"
                              />
                            )}
                            value={
                              songs.find(song => song.id === match.songId) ??
                              null
                            }
                            onChange={(event, value) => {
                              setFieldValue(
                                `matches.${index}.songId`,
                                value?.id ?? null
                              );
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </FieldArray>
            </Table>
          </form>
        )}
      </Formik>
    </TableContainer>
  );
};
