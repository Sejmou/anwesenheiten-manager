import Head from 'next/head';

type Props = { title: string; description?: string };
const PageHead = ({ title, description }: Props) => {
  return (
    <Head>
      <title>{title} (TU Wien Chor Admin-Dashboard)</title>
      {description && <meta name="description" content={description} />}
    </Head>
  );
};
export default PageHead;
