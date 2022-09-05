import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  PreviewData,
  Redirect,
} from 'next';
import { getSession } from 'next-auth/react';
import { ParsedUrlQuery } from 'querystring';

export const VoiceGroupToDescriptionString: { [voiceGroup: string]: string } = {
  S1: 'Sopran 1',
  S2: 'Sopran 2',
  S2_M: 'Sopran 2/Mezzo',
  A1_M: 'Alt 1/Mezzo',
  A1: 'Alt 1',
  A2: 'Alt 2',
  T1: 'Tenor 1',
  T2: 'Tenor 2',
  B1: 'Bass 1',
  B2: 'Bass 2',
  D: 'Dirigent',
};

/**
 * This is a workaround to use on all pages requiring authentication until NextAuth devlopers make route protection middleware work with NextJS 12.2+
 *
 * The current implementation is incompatible due to rewrite of NextJS's Middleware system in version 12.2 :/
 *
 * This workaround should be added to every authenticated page in the beginning of getStaticProps(). If a value is returned, it should be returned from getStaticProps()
 *
 * Here's how to use that inside of a page:
 * ```
 * export const getServerSideProps: GetServerSideProps<Props> = async context => {
 *   const redirect = await serversideAuthGuard(context);
 *   if (redirect) return redirect;
 *     //... do other stuff
 * }
 * ```
 *
 */
export async function serversideAuthGuard<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
>(
  context: GetServerSidePropsContext<Q, D>
): Promise<{ redirect: Redirect } | undefined> {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
