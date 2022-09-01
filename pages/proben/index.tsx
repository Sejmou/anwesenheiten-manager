import { Button, Typography } from '@mui/material';
import { NextPage } from 'next';

type Props = {};
const Proben: NextPage<Props> = () => {
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
export default Proben;
