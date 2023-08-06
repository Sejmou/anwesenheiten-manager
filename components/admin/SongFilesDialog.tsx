import { useState } from 'react';
import { List, ListItem, IconButton, TextField, Stack } from '@mui/material';

import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import { SongFile, LinkType, linkTypeValues } from 'drizzle/models';
import BasicSelect from '../BasicSelect';
import BasicDialog from 'components/BasicDialog';

export interface SongFileEditDialogProps {
  open: boolean;
  files: SongFile[];
  songId: string;
  songName: string;
  onSave: (files: SongFile[]) => void;
  onClose: () => void;
}

function SongFilesDialog(props: SongFileEditDialogProps) {
  const {
    open,
    files: existingFiles,
    songId,
    songName,
    onSave,
    onClose,
  } = props;
  const [files, setFiles] = useState<SongFile[]>(existingFiles);

  const handleSave = () => {
    onSave(files);
  };

  const handleClose = () => {
    onClose();
  };

  const handleAdd = (file: SongFile) => {
    setFiles([...files, file]);
  };

  const handleEdit = (file: SongFile, i: number) => {
    const newFiles = [...files];
    newFiles[i] = file;
    setFiles(newFiles);
  };

  const handleRemove = (file: SongFile) => {
    setFiles(files.filter(f => f !== file));
  };

  return (
    <BasicDialog
      onClose={handleClose}
      open={open}
      fullWidth
      maxWidth="xl"
      title={`Files für '${songName}'`}
      onSave={handleSave}
    >
      <List>
        {files.map((file, i) => (
          <FileLink
            variant="existing"
            key={file.songId + file.name}
            file={file}
            onEdit={file => handleEdit(file, i)}
            onRemove={() => handleRemove(file)}
          />
        ))}
        <FileLink
          variant="new"
          songId={songId}
          onAdd={file => handleAdd(file)}
        />
      </List>
    </BasicDialog>
  );
}

function getLabelForLinkType(type: SongFile['type']) {
  switch (type) {
    case 'Audio':
      return 'Audio (allgemein)';
    case 'AudioInitialNotes':
      return 'Anfangstöne';
    case 'AudioPracticeTrack':
      return 'Übungstrack';
    case 'AudioRecording':
      return 'Aufnahme';
    case 'PDF':
      return 'PDF';
    case 'Video':
      return 'Video';
    case 'MuseScore':
      return 'MuseScore';
    case 'Other':
      return 'Diverses';
    default:
      console.warn(
        `Cannot find label for DB link type '${type}' - using as label in UI`
      );
      return type;
  }
}

const options = linkTypeValues
  .map(type => ({
    label: getLabelForLinkType(type),
    value: type,
  }))
  .sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()));

type FileLinkProps =
  | {
      variant: 'existing';
      file: SongFile;
      onEdit: (file: SongFile) => void;
      onRemove: () => void;
    }
  | {
      variant: 'new';
      songId: string;
      onAdd: (file: SongFile) => void;
    };

const FileLink = (props: FileLinkProps) => {
  const file: SongFile =
    props.variant === 'existing'
      ? props.file
      : {
          name: '',
          type: 'AudioInitialNotes',
          url: '',
          songId: props.songId,
        };

  const [name, setName] = useState(file.name);
  const [type, setType] = useState(file.type);
  const [url, setUrl] = useState(file.url);

  return (
    <ListItem>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          width: '100%',
        }}
        alignItems="center"
      >
        <TextField
          label="Name"
          value={name}
          sx={{
            flex: 1,
          }}
          onChange={e => setName(e.target.value)}
        />
        <BasicSelect<LinkType>
          optionsTypeLabel="Link-Typ"
          value={type}
          onChange={newType => setType(newType)}
          options={options}
        />
        <TextField
          label="URL"
          sx={{
            flex: 1,
          }}
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <IconButton
          sx={{ display: 'block' }}
          onClick={
            props.variant === 'existing'
              ? props.onRemove
              : () => props.onAdd({ name, type, url, songId: props.songId })
          }
        >
          {props.variant === 'existing' ? <Delete /> : <Add color="primary" />}
        </IconButton>
      </Stack>
    </ListItem>
  );
};

export default SongFilesDialog;
