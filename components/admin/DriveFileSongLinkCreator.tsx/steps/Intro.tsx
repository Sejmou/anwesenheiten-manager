import { Stack, Typography } from '@mui/material';

const IntroStep = () => {
  return (
    <Stack spacing={1}>
      <Typography>Willkommen zum Magic File Linker!</Typography>
      <Typography>
        Mit diesem Tool kannst du die Files aus dem Google Drive Ordner
        automatisch mit den Liedern im Repertoire verlinken.
      </Typography>
    </Stack>
  );
};

export default IntroStep;
