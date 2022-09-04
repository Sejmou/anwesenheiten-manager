import {
  createStore,
  action,
  thunk,
  computed,
  Action,
  Thunk,
  Computed,
  createTypedHooks,
} from 'easy-peasy';

interface GlobalMessageState {
  messages: string[];
  currentMessage: Computed<GlobalMessageState, string | undefined>;
  addMessage: Thunk<GlobalMessageState, string>;
  addedMessage: Action<GlobalMessageState, string>;
  removeMessage: Action<GlobalMessageState, string>;
}

/**
 * The time it takes for the currently visible message to automatically disappear
 */
const AUTOHIDE_INTERVAL = 3000;

const globalMessageStore = createStore<GlobalMessageState>({
  messages: [],
  currentMessage: computed(state => state.messages[0]),
  addedMessage: action((state, payload) => {
    console.log('adding message', payload);
    state.messages.push(payload);
  }),
  addMessage: thunk((actions, payload, { getState }) => {
    actions.addedMessage(payload); // add message to the messages that should be displayed
    setTimeout(() => {
      actions.removeMessage(payload);
    }, AUTOHIDE_INTERVAL * getState().messages.length);
  }),
  removeMessage: action((state, payload) => {
    console.log('removing message', payload);
    state.messages = state.messages.filter(message => message !== payload);
  }),
});

export default globalMessageStore;

const typedHooks = createTypedHooks<GlobalMessageState>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreDispatch = typedHooks.useStoreDispatch;
export const useStoreState = typedHooks.useStoreState;
