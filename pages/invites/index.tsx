import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import Layout from '../../components/Layout';
import prisma from '../../lib/prisma';

// TODO: fetch choir practice schedule or something else from DB
// export const getStaticProps: GetStaticProps = async () => {
//   return {
//     props: {},
//     revalidate: 10, // enables Incremental Static Site Generation; will trigger update of served static page content if more than 10 seconds passed since last request by some client
//   };
// };

type Props = {};

const Invites: NextPage = (props: Props) => {
  return (
    <Layout>
      <div className="page">
        <h1>Invites</h1>
        TODO
      </div>
    </Layout>
  );
};

export default Invites;
