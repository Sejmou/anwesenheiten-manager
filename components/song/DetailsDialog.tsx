import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { Song, SongAttachment } from 'drizzle/models';
import BasicDialog from '../BasicDialog';
import TextAttributeDisplay from '../TextAttributeDisplay';
import SongAttachments from './Attachments';

type SongWithAttachments = Song & { attachments: SongAttachment[] };

type Props = {
  song: SongWithAttachments;
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
      {song.attachments.length > 0 && (
        <SongAttachments attachments={song.attachments} />
      )}
      {song.attachments.length === 0 && (
        <Typography>Es sind keine Files verlinkt.</Typography>
      )}
    </BasicDialog>
  );
};

export default SongDetailsDialog;
