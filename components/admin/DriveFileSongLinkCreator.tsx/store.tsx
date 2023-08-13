import { create } from 'zustand';
import Intro from './steps/Intro';
import SelectDriveFolder from './steps/SelectDriveFolder';
import MatchFolderNames from './steps/MatchFolderNames';
import { computed } from 'zustand-middleware-computed-state';

type Step = {
  id: StepID;
  title: string;
  component: React.ReactNode;
};

type BaseStore = {
  songsFolderId: string | null;
  steps: readonly Step[];
  currentStepIdx: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleCancel: () => void; // should be called when the user cancels the process
  handleStepCompleted: () => void; //should be called by each step when it is completed (useEffect hook is probably the best place for this)
  handleFolderSelected: (folderId: string) => void;
};

type ComputedStore = {
  canGoToNextStep: boolean;
  canGoToPreviousStep: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStep: Step;
};

type LinkCreatorStore = BaseStore & ComputedStore;

type SetType = (
  partial:
    | BaseStore
    | Partial<BaseStore>
    | ((state: BaseStore) => BaseStore | Partial<BaseStore>),
  replace?: boolean | undefined
) => void;

type StepID = 'intro' | 'select-folder' | 'match-names';

const steps: readonly Step[] = [
  {
    id: 'intro',
    title: 'Einleitung',
    component: <Intro />,
  },
  {
    id: 'select-folder',
    title: 'Ordner auswählen',
    component: <SelectDriveFolder />,
  },
  {
    id: 'match-names',
    title: 'Ordnernamen mit Liedern verknüpfen',
    component: <MatchFolderNames />,
  },
] as const;

const completionCheckers: {
  [key in StepID]: (state: BaseStore) => boolean;
} = {
  intro: state => true,
  'select-folder': state => !!state.songsFolderId,
  'match-names': state => true,
};

function computedState(state: BaseStore): ComputedStore {
  const currentStep = state.steps[state.currentStepIdx]!;
  const isFirstStep = state.currentStepIdx === 0;
  const isLastStep = state.currentStepIdx === state.steps.length - 1;
  const canGoToNextStep =
    completionCheckers[currentStep.id](state) && !isLastStep;
  const canGoToPreviousStep = !isFirstStep;

  return {
    canGoToNextStep,
    canGoToPreviousStep,
    currentStep,
    isFirstStep,
    isLastStep,
  };
}

export const useLinkCreatorStore = create<LinkCreatorStore>(
  computed<BaseStore, ComputedStore>(
    (set: SetType, get: () => LinkCreatorStore) => ({
      songsFolderId: null,
      steps,
      currentStepIdx: 0,
      goToPreviousStep: () => {
        const { currentStepIdx } = get();
        if (currentStepIdx > 0) {
          set(state => ({ currentStepIdx: state.currentStepIdx - 1 }));
        } else {
          console.warn('Cannot go to previous step, already at first step');
        }
      },
      goToNextStep: () => {
        const { currentStepIdx } = get();
        if (currentStepIdx < get().steps.length - 1) {
          set(state => ({ currentStepIdx: state.currentStepIdx + 1 }));
        } else {
          console.warn('Cannot go to next step, already at last step');
        }
      },
      handleCancel: () => {
        set(() => ({
          currentStepIdx: 0,
        }));
      },
      handleStepCompleted: () => {},
      handleFolderSelected: folderId => {
        set(() => ({
          songsFolderId: folderId,
        }));
      },
    }),
    computedState
  )
);
