import { Stack, Typography } from '@mui/material';
import { FolderSelect } from './FolderSelect';
import { publicFolderId } from 'utils/google-drive';
import { api } from 'utils/api';
import { useLinkCreatorStore } from '../../store';

const SelectDriveFolderStep = () => {
  const getRootFolder =
    api.googleDrive.getFolderWithAllSubfolders.useQuery(publicFolderId);
  const isLoading = getRootFolder.isLoading;
  const isError = getRootFolder.isError;

  const rootFolder = getRootFolder.data;
  const handleFolderSelected = useLinkCreatorStore(
    store => store.handleFolderSelected
  );

  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <Typography>
          Wähle den Ordner aus von dem du Files für Lieder importieren möchtest.
          Die Namen der Unterordner sollen ungefähr den Namen der Lieder
          entsprechen.
        </Typography>
        <Typography>
          Der Magic File Linker wird im Anschluss versuchen, die Ordnernamen mit
          den Liedern zu verknüpfen. Du kannst natürlich noch Korrekturen
          vornehmen. Falls bestimmte Ordner keinem Lied zugeordnet werden
          sollen, kannst du die entsprechenden Einträge auch einfach später
          löschen.
        </Typography>
      </Stack>
      {isLoading && <Typography>Ordner werden geladen...</Typography>}
      {isError && <Typography>Ordner konnten nicht geladen werden.</Typography>}
      {rootFolder && (
        <FolderSelect rootFolder={rootFolder} onSelect={handleFolderSelected} />
      )}
    </Stack>
  );
};

export default SelectDriveFolderStep;
