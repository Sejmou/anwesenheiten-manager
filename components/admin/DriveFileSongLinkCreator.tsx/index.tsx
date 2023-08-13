import { Button, Stepper } from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useLinkCreatorStore } from './store';

type Props = {
  onClose: () => void;
};

const DriveFileSongLinkCreator = ({ onClose }: Props) => {
  const goToNextStep = useLinkCreatorStore(state => state.goToNextStep);
  const goToPreviousStep = useLinkCreatorStore(state => state.goToPreviousStep);
  const canGoToNextStep = useLinkCreatorStore(state => state.canGoToNextStep);
  const canGoToPreviousStep = useLinkCreatorStore(
    state => state.canGoToPreviousStep
  );
  const steps = useLinkCreatorStore(state => state.steps);
  const currentStep = useLinkCreatorStore(state => state.currentStep);

  const handleClose = () => {
    onClose();
  };

  const handleNext = () => {
    if (isFinalStep) {
      handleSave();
    } else {
      goToNextStep();
    }
  };
  const handlePrev = () => {
    if (isFirstStep) handleClose();
    goToPreviousStep();
  };

  const handleSave = () => {
    alert('Das ist leider noch nicht ausprogrammiert.');
  };

  const isFirstStep = currentStep === 0;
  const isFinalStep = currentStep === steps.length - 1;

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Magic File Linker</DialogTitle>
      <DialogContent sx={{ height: '90vh' }}>
        <Stepper></Stepper>
        {steps[currentStep]?.component}
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePrev} disabled={!canGoToPreviousStep}>
          {isFirstStep ? 'Abbrechen' : 'Zurück'}
        </Button>
        <Button onClick={handleNext} disabled={!canGoToNextStep}>
          {isFinalStep ? 'Speichern' : 'Weiter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriveFileSongLinkCreator;
