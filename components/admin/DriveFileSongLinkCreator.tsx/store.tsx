import { create } from 'zustand';
import Intro from './steps/Intro';
import SelectDriveFolder from './steps/SelectDriveFolder';
import MatchFolderNames from './steps/MatchFolderNames';
import { computed } from 'zustand-middleware-computed-state';
import LinkFiles from './steps/LinkFiles';

type Step = {
  id: StepID;
  title: string;
  component: React.ReactNode;
  notCompletedHint?: string;
};

export type FolderToSongMapping = {
  folderId: string;
  folderName: string;
  songId?: string;
};

type BaseStore = {
  steps: readonly Step[];
  currentStepIdx: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleCancel: () => void; // should be called when the user cancels the process
  songsFolderId: string | null;
  handleFolderSelected: (folderId: string) => void;
  mappings: FolderToSongMapping[] | null;
  handleMappingsChange: (mappings: FolderToSongMapping[]) => void;
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

type StepID = 'intro' | 'select-folder' | 'match-names' | 'verify-mappings';

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
    notCompletedHint: 'Du hast noch keinen Ordner ausgewählt',
  },
  {
    id: 'match-names',
    title: 'Ordnernamen mit Liedern verknüpfen',
    component: <MatchFolderNames />,
    notCompletedHint: 'Verknüpfe zumindest einen Ordner mit einem Lied',
  },
  {
    id: 'verify-mappings',
    title: 'Verknüpfungen überprüfen',
    component: <LinkFiles />,
  },
] as const;

const completionCheckers: {
  [key in StepID]: (state: BaseStore) => boolean;
} = {
  intro: () => true,
  'select-folder': state => !!state.songsFolderId,
  'match-names': state =>
    !!state.mappings && state.mappings.filter(m => m.songId != null).length > 0,
  'verify-mappings': () => true,
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
      mappings: null,
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
      handleMappingsChange: mappings => {
        set(() => ({
          mappings,
        }));
      },
    }),
    computedState
  )
);
