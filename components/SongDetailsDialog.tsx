import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { Song, SongFileLink } from 'drizzle/models';
import BasicDialog from './BasicDialog';
import TextAttributeDisplay from './TextAttributeDisplay';

type SongWithFiles = Song & { fileLinks: SongFileLink[] };

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
      {song.fileLinks.length > 0 && (
        <List>
          {song.fileLinks.map((file, i) => (
            <ListItem key={file.songId + file.label}>
              <ListItemButton>
                <ListItemText primary={file.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
      {song.fileLinks.length === 0 && (
        <Typography>Es sind keine Files verlinkt.</Typography>
      )}
    </BasicDialog>
  );
};

export default SongDetailsDialog;
