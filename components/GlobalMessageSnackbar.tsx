import { Snackbar } from '@mui/material';
import { useStoreState } from '../lib/message-store';

type Props = {};
const GlobalMessageSnackbar = (props: Props) => {
  const message = useStoreState(state => state.currentMessage);
  return <Snackbar open={!!message} message={message} />;
};
export default GlobalMessageSnackbar;
