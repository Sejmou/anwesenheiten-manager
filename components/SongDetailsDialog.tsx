import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { Song, SongFile } from 'drizzle/models';
import BasicDialog from './BasicDialog';
import TextAttributeDisplay from './TextAttributeDisplay';

type SongWithFiles = Song & { files: SongFile[] };

type Props = {
  song: SongWithFiles;
  open: boolean;
  onClose: () => void;
};

const SongDetailsDialog = ({ song, open, onClose }: Props) => {
  return (
    <BasicDialog
      title={song.name}
      open={open}
      onClose={onClose}
      closeButtonText={'Schließen'}
      fullWidth={true}
      maxWidth="md"
      titleHeadingVariant="h3"
    >
      <TextAttributeDisplay
        attributesAndHeadings={[
          [song.key, 'Tonart'],
          [song.notes, 'Notizen'],
        ]}
      />
      <Typography variant="h6">Files</Typography>
      {song.files.length > 0 && (
        <List>
          {song.files.map((file, i) => (
            <ListItem key={file.songId + file.name}>
              <ListItemButton>
                <ListItemText primary={file.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
      {song.files.length === 0 && (
        <Typography>Es sind keine Files verlinkt.</Typography>
      )}
    </BasicDialog>
  );
};

export default SongDetailsDialog;
