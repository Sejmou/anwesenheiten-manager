import Head from 'next/head';

type Props = { title: string; description?: string };
const AdminPageHead = ({ title, description }: Props) => {
  return (
    <Head>
      <title>{`${title} - TU Chor Admin-Dashboard`}</title>
      {description && <meta name="description" content={description} />}
    </Head>
  );
};
export default AdminPageHead;
