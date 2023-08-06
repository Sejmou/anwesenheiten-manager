import Head from 'next/head';

type Props = { title: string; description?: string };
const PublicPageHead = ({ title, description }: Props) => {
  return (
    <Head>
      <title>{`${title} - TU Wien Chor`}</title>
      {description && <meta name="description" content={description} />}
    </Head>
  );
};
export default PublicPageHead;
