import React from 'react';
import Typography from '@mui/material/Typography';
import { NextPageWithLayout } from '../_app';
import { getAuthenticatedPageLayout } from '../../components/layout/get-page-layouts';

// TODO: fetch choir practice schedule or something else from DB
// export const getStaticProps: GetStaticProps = async () => {
//   return {
//     props: {},
//     revalidate: 10, // enables Incremental Static Site Generation; will trigger update of served static page content if more than 10 seconds passed since last request by some client
//   };
// };

type Props = {};

const Attendance: NextPageWithLayout = (props: Props) => {
  return (
    <>
      <Typography variant="body1">
        Auf dieser Seite wird es bald die Möglichkeit geben, Probenanwesenheiten
        einzutragen.
      </Typography>
    </>
  );
};

Attendance.getLayout = getAuthenticatedPageLayout;

export default Attendance;
