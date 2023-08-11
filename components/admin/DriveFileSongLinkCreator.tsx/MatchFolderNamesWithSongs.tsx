import {
  Autocomplete,
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

type Props = {
  folderId: string;
};

type Song = RouterOutputs['song']['getAll'][0];

const MatchFolderNamesWithSongs = ({ folderId }: Props) => {
  const getMatches =
    api.googleDrive.getSongMatchesForSubfolderNames.useQuery(folderId);
  const getSongs = api.song.getAll.useQuery();

  const songs = getSongs.data ?? [];
  const matches = getMatches.data ?? [];

  const loadingData = getMatches.isLoading || getSongs.isLoading;
  const error = getMatches.error || getSongs.error;

  if (error)
    return <Typography color="error">Fehler beim Laden der Daten</Typography>;
  if (loadingData) return <Typography>Lade Daten...</Typography>;

  return (
    <NameMatchForm
      matchesFromDB={matches.map(m => ({
        folderId: m.id!,
        folderName: m.name,
        songId: m.song.id,
      }))}
      songs={songs}
    />
  );
};

export default MatchFolderNamesWithSongs;

type NameMatchFormProps = {
  matchesFromDB: {
    folderId: string;
    folderName: string;
    songId: string;
  }[];
  songs: Song[];
};

const NameMatchForm = ({ matchesFromDB, songs }: NameMatchFormProps) => {
  return (
    <TableContainer component={Paper}>
      <Formik
        initialValues={{
          matches: matchesFromDB,
        }}
        onSubmit={values => {
          console.log(values);
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
                                label="Verlinktes Lied"
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
