import React from 'react';
import { NextPage } from 'next';
import Typography from '@mui/material/Typography';

// TODO: fetch choir practice schedule or something else from DB
// export const getStaticProps: GetStaticProps = async () => {
//   return {
//     props: {},
//     revalidate: 10, // enables Incremental Static Site Generation; will trigger update of served static page content if more than 10 seconds passed since last request by some client
//   };
// };

type Props = {};

const Anwesenheiten: NextPage = (props: Props) => {
  return (
    <>
      <Typography variant="body1">
        Auf dieser Seite wird es bald die Möglichkeit geben, Probenanwesenheiten
        einzutragen.
      </Typography>
    </>
  );
};

export default Anwesenheiten;
