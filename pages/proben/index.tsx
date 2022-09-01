import { Button, Typography } from '@mui/material';
import { getAuthenticatedPageLayout } from '../../components/layout/get-page-layouts';
import { NextPageWithLayout } from '../_app';

type Props = {};
const ChoirPractice: NextPageWithLayout<Props> = () => {
  return (
    <>
      <Typography variant="body1">
        Hier können bald die Probentermine gemanagt werden.
      </Typography>
      <form action="">
        <input type="datetime" name="start" id="start" />
        <input type="datetime" name="end" id="end" />
        <Button type="submit">Neue Probe anlegen</Button>
      </form>
    </>
  );
};

ChoirPractice.getLayout = getAuthenticatedPageLayout;

export default ChoirPractice;
