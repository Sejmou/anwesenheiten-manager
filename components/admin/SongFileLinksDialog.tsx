import { useState } from 'react';
import { List, ListItem, IconButton, TextField, Stack } from '@mui/material';

import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import { SongFileLink, LinkType, linkTypeValues } from 'drizzle/models';
import BasicSelect from '../BasicSelect';
import BasicDialog from 'components/BasicDialog';
import { songLinkTypeOptions } from 'frontend-utils';

export interface SongFileLinkEditDialogProps {
  open: boolean;
  links: SongFileLink[];
  songId: string;
  songName: string;
  onSave: (files: SongFileLink[]) => void;
  onClose: () => void;
}

function SongFileLinksDialog(props: SongFileLinkEditDialogProps) {
  const {
    open,
    links: existingFiles,
    songId,
    songName,
    onSave,
    onClose,
  } = props;
  const [files, setFiles] = useState<SongFileLink[]>(existingFiles);

  const handleSave = () => {
    onSave(files);
  };

  const handleClose = () => {
    onClose();
  };

  const handleAdd = (file: SongFileLink) => {
    setFiles([...files, file]);
  };

  const handleEdit = (file: SongFileLink, i: number) => {
    const newFiles = [...files];
    newFiles[i] = file;
    setFiles(newFiles);
  };

  const handleRemove = (file: SongFileLink) => {
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
            key={file.songId + file.label}
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

type FileLinkProps =
  | {
      variant: 'existing';
      file: SongFileLink;
      onEdit: (file: SongFileLink) => void;
      onRemove: () => void;
    }
  | {
      variant: 'new';
      songId: string;
      onAdd: (file: SongFileLink) => void;
    };

const FileLink = (props: FileLinkProps) => {
  const file: SongFileLink =
    props.variant === 'existing'
      ? props.file
      : {
          label: '',
          type: 'AudioInitialNotes',
          url: '',
          songId: props.songId,
        };

  const [label, setLabel] = useState(file.label);
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
        <BasicSelect<LinkType>
          optionsTypeLabel="Link-Typ"
          value={type}
          onChange={newType => setType(newType)}
          options={songLinkTypeOptions}
        />
        <TextField
          label="Link-Label"
          value={label}
          sx={{
            flex: 1,
          }}
          onChange={e => setLabel(e.target.value)}
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
              : () => props.onAdd({ label, type, url, songId: props.songId })
          }
        >
          {props.variant === 'existing' ? <Delete /> : <Add color="primary" />}
        </IconButton>
      </Stack>
    </ListItem>
  );
};

export default SongFileLinksDialog;
