import { publicFolderId } from 'utils/google-drive';
import { create } from 'zustand';
import Intro from './steps/Intro';
import SelectDriveFolder from './steps/SelectDriveFolder';
import MatchFolderNames from './steps/MatchFolderNames';

type LinkCreatorStore = {
  songsFolderId: string | null;
  steps: Step[];
  completedSteps: boolean[];
  currentStep: number;
  canGoToNextStep: boolean;
  canGoToPreviousStep: boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleCancel: () => void; // should be called when the user cancels the process
  handleStepCompleted: () => void; //should be called by each step when it is completed (useEffect hook is probably the best place for this)
  handleFolderSelected: (folderId: string) => void;
};

type Step = {
  title: string;
  component: React.ReactNode;
};

const steps = [
  {
    title: 'Einleitung',
    component: <Intro />,
  },
  {
    title: 'Ordner auswählen',
    component: <SelectDriveFolder />,
  },
  {
    title: 'Ordnernamen mit Liedern verknüpfen',
    component: <MatchFolderNames />,
  },
];

export const useLinkCreatorStore = create<LinkCreatorStore>((set, get) => ({
  songsFolderId: publicFolderId,
  steps,
  completedSteps: steps.map(() => false),
  currentStep: 0,
  // TODO: figure out how to use computed/derived store for canGoToNextStep and canGoToPreviousStep
  canGoToPreviousStep: true,
  canGoToNextStep: true,
  goToPreviousStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set(state => ({ currentStep: state.currentStep - 1 }));
    }
  },
  goToNextStep: () => {
    const { currentStep } = get();
    if (currentStep < get().steps.length - 1) {
      set(state => ({ currentStep: state.currentStep + 1 }));
    }
  },
  handleCancel: () => {
    set(() => ({
      currentStep: 0,
      canGoToNextStep: false,
      canGoToPreviousStep: false,
    }));
  },
  handleStepCompleted: () => {
    set(() => ({
      completedSteps: get().completedSteps.map((completed, index) =>
        index === get().currentStep ? true : completed
      ),
    }));
  },
  handleFolderSelected: folderId => {
    set(() => ({
      songsFolderId: folderId,
    }));
  },
}));
