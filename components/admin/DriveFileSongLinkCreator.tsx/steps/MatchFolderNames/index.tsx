import { Stack, Typography } from '@mui/material';
import { useLinkCreatorStore } from '../../store';
import MatchFolderNamesWithSongs from './MatchFolderNamesWithSongs';

const MatchFolderNamesStep = () => {
  const folderId = useLinkCreatorStore(state => state.songsFolderId);

  return (
    <Stack spacing={1}>
      <Typography>
        Hier kannst du sehen, wie der Magic File Linker die Ordnernamen mit
        Songs gematcht hat. Wenn du Fehler siehst, korrigiere sie bitte.
      </Typography>
      {folderId && <MatchFolderNamesWithSongs folderId={folderId} />}
    </Stack>
  );
};

export default MatchFolderNamesStep;
