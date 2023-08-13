import { useEffect, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Typography,
} from '@mui/material';
import { RouterOutputs } from 'utils/api';
import { OpenInNew } from '@mui/icons-material';
type GoogleDriveFolder =
  RouterOutputs['googleDrive']['getFolderWithAllSubfolders'];

type Props = {
  rootFolder: GoogleDriveFolder;
  onSelect: (folderId: string) => void;
};

export const FolderSelect = ({ rootFolder, onSelect, ...props }: Props) => {
  const [parentFolders, setParentFolders] = useState<GoogleDriveFolder[]>([
    rootFolder,
  ]);
  const [currentFolder, setCurrentFolder] =
    useState<GoogleDriveFolder>(rootFolder);

  const [currentLevel, setCurrentLevel] = useState(0);

  const handleJumpToParent = (
    targetParent: GoogleDriveFolder,
    level: number
  ) => {
    setCurrentFolder(targetParent);
    setCurrentLevel(level);
    setParentFolders(parentFolders.slice(0, level + 1));
  };

  const handleSubfolderClick = (subfolder: GoogleDriveFolder) => {
    setParentFolders([...parentFolders, subfolder]);
    setCurrentFolder(subfolder);
    setCurrentLevel(currentLevel + 1);
  };

  useEffect(() => {
    onSelect(currentFolder.id);
  }, [currentFolder]);

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          backgroundColor: 'whitesmoke',
          py: 1,
          px: 2,
          borderBottom: '1px solid lightgrey',
        }}
      >
        <Typography variant="subtitle2">Gewählter Ordner:</Typography>
        <Breadcrumbs>
          {parentFolders.map((folder, level) =>
            level !== parentFolders.length - 1 ? (
              <Link
                onClick={() => handleJumpToParent(folder, level)}
                key={folder.id}
                underline={level == parentFolders.length - 1 ? 'none' : 'hover'}
                color="inherit"
              >
                {folder.name}
              </Link>
            ) : (
              <Typography color="text.primary" key={folder.id}>
                {folder.name}
              </Typography>
            )
          )}
        </Breadcrumbs>
        <IconButton
          size="small"
          target="_blank"
          href={`https://drive.google.com/drive/folders/${currentFolder.id}`}
        >
          <OpenInNew />
        </IconButton>
      </Stack>
      <List disablePadding sx={{ mt: 0 }}>
        {currentFolder.subfolders.map(subfolder => (
          <ListItem disablePadding key={subfolder.id}>
            <ListItemButton
              onClick={() => {
                handleSubfolderClick(subfolder);
              }}
            >
              {subfolder.name}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
