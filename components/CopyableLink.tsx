import { IconButton, Stack, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { MouseEventHandler } from 'react';
import { useStoreActions } from '../lib/message-store';

type Props = { link: string; message: string };
const CopyableLink = ({ link, message }: Props) => {
  const addMessage = useStoreActions(actions => actions.addMessage);

  const clickHandler: MouseEventHandler<HTMLButtonElement> = event => {
    navigator.clipboard.writeText(link);
    addMessage(message);
  };

  return (
    <Stack direction="row" overflow="hidden" alignItems="center">
      <Typography variant="body2" noWrap textOverflow="ellipsis">
        {link}
      </Typography>
      <IconButton onClick={clickHandler}>
        <ContentCopyIcon />
      </IconButton>
    </Stack>
  );
};
export default CopyableLink;
