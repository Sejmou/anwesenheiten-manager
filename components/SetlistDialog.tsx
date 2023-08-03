import { useState } from 'react';
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
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';

export interface SetlistDialogProps {
  open: boolean;
  songsToSelectFrom: { label: string | null; id: string }[];
  onSave: (songIds: string[]) => void;
  onClose: () => void;
}

function SetlistDialog(props: SetlistDialogProps) {
  const { onSave, onClose, songsToSelectFrom, open } = props;
  const [setlistSongIds, setSetlistSongIds] = useState<string[]>([]);

  const handleSave = () => {
    onSave(setlistSongIds);
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
      const temp = newSetlistData[songIndex - 1];
      newSetlistData[songIndex - 1] = newSetlistData[songIndex];
      newSetlistData[songIndex] = temp;
      setSetlistSongIds(newSetlistData);
    }
  };

  const handleMoveDownClick = (songId: string) => {
    const songIndex = setlistSongIds.findIndex(id => id === songId);
    if (songIndex < setlistSongIds.length - 1) {
      const newSetlistData = [...setlistSongIds];
      const temp = newSetlistData[songIndex + 1];
      newSetlistData[songIndex + 1] = newSetlistData[songIndex];
      newSetlistData[songIndex] = temp;
      setSetlistSongIds(newSetlistData);
    }
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <DialogTitle>Neue Setlist</DialogTitle>
      <DialogContent>
        <Autocomplete
          sx={{ paddingTop: 1 }}
          options={songsToSelectFrom}
          renderInput={params => (
            <TextField
              {...params}
              label="Song"
              placeholder="Wähle einen Song"
              variant="outlined"
            />
          )}
          onChange={(event, value) => {
            if (value) {
              setSetlistSongIds([...setlistSongIds, value.id]);
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
