import { IconButton, Stack, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { MouseEventHandler } from 'react';

type Props = { link: string };
const CopyableLink = ({ link }: Props) => {
  const clickHandler: MouseEventHandler<HTMLButtonElement> = event => {
    navigator.clipboard.writeText(link);
  };

  console.log(link);

  return (
    <Stack direction="row" overflow="hidden" alignItems="center">
      <Typography noWrap textOverflow="ellipsis">
        {link}
      </Typography>
      <IconButton onClick={clickHandler}>
        <ContentCopyIcon />
      </IconButton>
    </Stack>
  );
};
export default CopyableLink;
