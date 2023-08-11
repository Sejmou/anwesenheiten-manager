import { Button, Stack, Stepper, Typography } from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { FolderSelect } from './FolderSelect';
import { RouterOutputs, api } from 'utils/api';
import { publicFolderId } from 'utils/google-drive';
import MatchFolderNamesWithSongs from './MatchFolderNamesWithSongs';
import { useLinkCreatorStore } from './store';

type GoogleDriveFolder =
  RouterOutputs['googleDrive']['getFolderWithAllSubfolders'];

type Props = {
  onClose: () => void;
};

type Step = {
  title: string;
  component: React.ReactNode;
};

const DriveFileSongLinkCreator = ({ onClose }: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const setSongsFolderId = useLinkCreatorStore(state => state.setSongsFolderId);

  const handleNext = () => {
    if (isFinalStep) {
      handleSave();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  const handlePrev = () => {
    if (isFirstStep) onClose();
    setCurrentStep(currentStep - 1);
  };

  const handleSave = () => {
    alert('Das ist leider noch nicht ausprogrammiert.');
  };
  const handleClose = () => {
    onClose();
  };

  const handleFolderSelect = (folder: GoogleDriveFolder) => {
    setSongsFolderId(folder.id);
  };

  const isFirstStep = currentStep === 0;
  const steps = useMemo<Step[]>(
    () => [
      {
        title: 'Einleitung',
        component: <IntroStep />,
      },
      {
        title: 'Ordner auswählen',
        component: <SelectDriveFolderStep onSelect={handleFolderSelect} />,
      },
      {
        title: 'Ordnernamen mit Liedern verknüpfen',
        component: <MatchFolderNamesStep />,
      },
    ],
    []
  );
  const isFinalStep = currentStep === steps.length - 1;

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Magic File Linker</DialogTitle>
      <DialogContent sx={{ height: '90vh' }}>
        <Stepper></Stepper>
        {steps[currentStep]?.component}
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePrev}>
          {isFirstStep ? 'Abbrechen' : 'Zurück'}
        </Button>
        <Button onClick={handleNext}>
          {isFinalStep ? 'Speichern' : 'Weiter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriveFileSongLinkCreator;

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

type SelectDriveFolderStepProps = {
  onSelect: (folder: GoogleDriveFolder) => void;
};

const SelectDriveFolderStep = ({ onSelect }: SelectDriveFolderStepProps) => {
  const getRootFolder =
    api.googleDrive.getFolderWithAllSubfolders.useQuery(publicFolderId);

  const rootFolder = getRootFolder.data;

  const isLoading = getRootFolder.isLoading;
  const isError = getRootFolder.isError;

  return (
    <Stack spacing={2}>
      <Typography>
        Wähle den Ordner aus, der die Ordner für die Lieder enthält, die du
        importieren möchtest.
      </Typography>
      <Typography>
        In der Ansicht für den Ordnerinhalt sollen die Namen also dem Namen der
        Lieder entsprechen.
      </Typography>
      {isLoading && <Typography>Ordner werden geladen...</Typography>}
      {isError && <Typography>Ordner konnten nicht geladen werden.</Typography>}
      {rootFolder && (
        <FolderSelect rootFolder={rootFolder} onSelect={onSelect} />
      )}
    </Stack>
  );
};

const MatchFolderNamesStep = () => {
  const folderId = useLinkCreatorStore(state => state.songsFolderId);

  return (
    <Stack spacing={1}>
      <Typography>
        Hier kannst du sehen, wie der Magic File Linker die Ordnernamen mit
        Songs gematcht hat. Wenn du Fehler siehst, korrigiere sie bitte.
      </Typography>
      {folderId && <MatchFolderNamesWithSongs folderId={folderId} />}
    </Stack>
  );
};
