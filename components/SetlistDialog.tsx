import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItem,
  Autocomplete,
  ListItemText,
  TextField,
  DialogContent,
  IconButton,
  Typography,
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';

export type SetlistDialogFormValues = {
  songIds: string[];
  name: string;
};

export interface SetlistDialogProps {
  open: boolean;
  songsToSelectFrom: { label: string | null; id: string }[];
  onSave: (values: SetlistDialogFormValues) => void;
  onClose: () => void;
  initialValues: SetlistDialogFormValues | null;
}

function SetlistDialog(props: SetlistDialogProps) {
  const { onSave, onClose, songsToSelectFrom, open } = props;
  const [setlistTitle, setSetlistTitle] = useState<string>('');
  const [setlistSongIds, setSetlistSongIds] = useState<string[]>([]);

  // hack to clear autocomplete field whenever a new song was added
  const [clearAutocompleteKey, setClearAutocompleteKey] = useState<number>(0);

  useEffect(() => {
    if (props.initialValues) {
      setSetlistSongIds(props.initialValues.songIds);
      setSetlistTitle(props.initialValues.name);
    } else {
      setSetlistSongIds([]);
      setSetlistTitle('');
    }
  }, [props.initialValues]);

  const handleSave = () => {
    onSave({ songIds: setlistSongIds, name: setlistTitle });
  };

  const handleClose = () => {
    onClose();
  };

  const handleRemoveClick = (songId: string) => {
    setSetlistSongIds(setlistSongIds.filter(id => id !== songId));
  };

  const handleMoveUpClick = (songId: string) => {
    const songIndex = setlistSongIds.findIndex(id => id === songId);
    if (songIndex > 0) {
      const newSetlistData = [...setlistSongIds];
      const temp = newSetlistData[songIndex - 1]!;
      newSetlistData[songIndex - 1] = newSetlistData[songIndex]!;
      newSetlistData[songIndex] = temp;
      setSetlistSongIds(newSetlistData);
    }
  };

  const handleMoveDownClick = (songId: string) => {
    const songIndex = setlistSongIds.findIndex(id => id === songId);
    if (songIndex < setlistSongIds.length - 1) {
      const newSetlistData = [...setlistSongIds];
      const temp = newSetlistData[songIndex + 1]!;
      newSetlistData[songIndex + 1] = newSetlistData[songIndex]!;
      newSetlistData[songIndex] = temp;
      setSetlistSongIds(newSetlistData);
    }
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <DialogTitle>
        {props.initialValues
          ? 'Programm bearbeiten'
          : 'Neues Auftrittsprogramm'}
      </DialogTitle>
      <DialogContent>
        <TextField
          sx={{ mt: 1 }}
          label="Name"
          variant="outlined"
          fullWidth
          value={setlistTitle}
          onChange={event => {
            setSetlistTitle(event.target.value);
          }}
        />
        <Typography sx={{ pt: 2 }}>Lieder</Typography>
        <Autocomplete
          sx={{ paddingTop: 1 }}
          options={songsToSelectFrom}
          key={clearAutocompleteKey}
          renderInput={params => (
            <TextField
              {...params}
              label="Lied hinzufügen"
              placeholder="Wähle ein Lied aus dem Repertoire"
              variant="outlined"
            />
          )}
          onChange={(event, value) => {
            if (value) {
              setSetlistSongIds([...setlistSongIds, value.id]);
              setClearAutocompleteKey(clearAutocompleteKey + 1);
            }
          }}
        />
        <List sx={{ pt: 0 }}>
          {setlistSongIds.map((id, i) => (
            <ListItem disableGutters key={i}>
              <ListItemText
                primary={songsToSelectFrom.find(s => s.id == id)?.label}
              />
              <IconButton onClick={() => handleMoveUpClick(id)}>
                <ArrowUpward />
              </IconButton>
              <IconButton onClick={() => handleMoveDownClick(id)}>
                <ArrowDownward />
              </IconButton>
              <IconButton onClick={() => handleRemoveClick(id)}>
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Speichern
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default SetlistDialog;
