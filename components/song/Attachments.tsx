import { Download, OpenInNew } from '@mui/icons-material';
import { IconButton, List, ListItem, ListItemText } from '@mui/material';
import { SongAttachment } from 'drizzle/models';

type Props = {
  attachments: SongAttachment[];
};

const SongAttachments = ({ attachments }: Props) => {
  return (
    <List>
      {attachments.map((link, i) => (
        <ListItem key={link.songId + link.label}>
          <ListItemText primary={link.label} />
          <IconButton href={link.viewUrl}>
            <OpenInNew />
          </IconButton>
          {link.downloadUrl && (
            <IconButton href={link.downloadUrl}>
              <Download />
            </IconButton>
          )}
        </ListItem>
      ))}
    </List>
  );
};

export default SongAttachments;
