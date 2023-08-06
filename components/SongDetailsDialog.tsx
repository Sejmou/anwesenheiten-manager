import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { Song, SongFileLink } from 'drizzle/models';
import BasicDialog from './BasicDialog';
import TextAttributeDisplay from './TextAttributeDisplay';
import { Download } from '@mui/icons-material';

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
    >
      <TextAttributeDisplay
        attributesAndHeadings={[
          [song.key, 'Tonart'],
          [song.notes, 'Notizen'],
        ]}
      />
      <Typography sx={{ fontWeight: 'bold' }}>Files</Typography>
      {song.fileLinks.length > 0 && (
        <List>
          {song.fileLinks.map((link, i) => (
            <ListItem key={link.songId + link.label}>
              <ListItemText primary={link.label} />
              <IconButton href={link.url}>
                <Download />
              </IconButton>
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
