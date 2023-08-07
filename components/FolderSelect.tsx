import { useState } from 'react';
import { Breadcrumbs, List, ListItem, ListItemButton } from '@mui/material';
import { RouterOutputs } from 'utils/api';
type GoogleDriveFolder =
  RouterOutputs['googleDrive']['getFolderWithAllSubfolders'];

type Props = {
  rootFolder: GoogleDriveFolder;
  onSelect: (folderId: string) => void;
};

export const FolderSelect = ({ rootFolder, onSelect }: Props) => {
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

  return (
    <>
      <Breadcrumbs>
        {parentFolders.map((folder, level) => (
          <span
            onClick={() => handleJumpToParent(folder, level)}
            key={folder.id}
          >
            {folder.name}
          </span>
        ))}
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
