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
  const currentStep = useLinkCreatorStore(state => state.currentStep);
  const goToNextStep = useLinkCreatorStore(state => state.goToNextStep);
  const goToPreviousStep = useLinkCreatorStore(state => state.goToPreviousStep);
  const canGoToNextStep = useLinkCreatorStore(state => state.canGoToNextStep);
  const canGoToPreviousStep = useLinkCreatorStore(
    state => state.canGoToPreviousStep
  );
  const isFirstStep = useLinkCreatorStore(state => state.isFirstStep);
  const isLastStep = useLinkCreatorStore(state => state.isLastStep);

  const handleClose = () => {
    onClose();
  };

  const handleNext = () => {
    if (isLastStep) {
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

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Magic File Linker</DialogTitle>
      <DialogContent sx={{ height: '90vh' }}>
        <Stepper></Stepper>
        {currentStep.component}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handlePrev}
          disabled={!isFirstStep && !canGoToPreviousStep}
        >
          {isFirstStep ? 'Abbrechen' : 'Zurück'}
        </Button>
        <Button onClick={handleNext} disabled={!isLastStep && !canGoToNextStep}>
          {isLastStep ? 'Speichern' : 'Weiter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DriveFileSongLinkCreator;
