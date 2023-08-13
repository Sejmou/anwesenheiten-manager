import { Stack, Typography } from '@mui/material';
import { useLinkCreatorStore } from '../../store';
import MatchFolderNamesWithSongs from './MatchFolderNamesWithSongs';

const MatchFolderNamesStep = () => {
  const folderId = useLinkCreatorStore(state => state.songsFolderId);

  return (
    <Stack spacing={1}>
      <Typography>
        Hier kannst du sehen, wie der Magic File Linker die Ordnernamen mit
        Songs gematcht hat.
      </Typography>
      <Stack>
        <Typography>
          Überprüfe die Ergebnisse und nimm gegebenenfalls Korrekturen vor.
        </Typography>
        <Typography>
          Möchtest du einen Ordner nicht verlinken, lass einfach das
          entsprechende Feld in der "Lied"-Spalte leer.
        </Typography>
      </Stack>
      {folderId && <MatchFolderNamesWithSongs folderId={folderId} />}
    </Stack>
  );
};

export default MatchFolderNamesStep;
