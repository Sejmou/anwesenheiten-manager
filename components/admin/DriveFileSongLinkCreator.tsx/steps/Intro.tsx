import { Stack, Typography } from '@mui/material';
import { useLinkCreatorStore } from '../store';
import { useEffect } from 'react';

const IntroStep = () => {
  const handleStepCompleted = useLinkCreatorStore(
    store => store.handleStepCompleted
  );
  useEffect(() => {
    handleStepCompleted();
  }, []);
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
