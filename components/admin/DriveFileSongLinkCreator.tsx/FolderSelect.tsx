import { useEffect, useState } from 'react';
import {
  Breadcrumbs,
  Link,
  List,
  ListItem,
  ListItemButton,
  Typography,
} from '@mui/material';
import { RouterOutputs } from 'utils/api';
type GoogleDriveFolder =
  RouterOutputs['googleDrive']['getFolderWithAllSubfolders'];

type Props = {
  rootFolder: GoogleDriveFolder;
  onSelect: (folder: GoogleDriveFolder) => void;
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
    onSelect(currentFolder);
  }, [currentFolder]);

  return (
    <>
      <Breadcrumbs
        sx={{
          backgroundColor: 'whitesmoke',
          py: 1,
          px: 2,
          borderBottom: '1px solid lightgrey',
        }}
      >
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
      <List disablePadding>
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
    </>
  );
};
