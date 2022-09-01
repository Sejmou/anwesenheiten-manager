import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Layout from '../../components/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InviteToken } from '../api/invite-tokens';

type Props = { inviteLinkBaseUrl: string };

const getTokens = () => fetch('/api/invite-tokens').then(data => data.json());
const generateToken = () => fetch('/api/invite-tokens', { method: 'POST' });

const Invites: NextPage<Props> = ({ inviteLinkBaseUrl }: Props) => {
  const { data: tokens, isLoading } = useQuery<InviteToken[]>(
    ['tokens'],
    getTokens,
    {
      initialData: [],
    }
  );
  const client = useQueryClient();

  const newTokenMutation = useMutation(generateToken, {
    onSuccess: () => client.invalidateQueries(['tokens']),
  });

  const tokenList = isLoading
    ? 'Lade Daten...'
    : tokens.length > 0
    ? tokens.map(t => (
        <>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div>
              <span>{`${inviteLinkBaseUrl}?token=${t.token}`}</span>
            </div>
            <div>
              <span>
                -{' '}
                {!t.used
                  ? 'noch nicht verwendet'
                  : `verwendet von ${t.usedBy?.name}, (${t.usedBy?.email})`}
              </span>
            </div>
          </div>
        </>
      ))
    : 'Es wurden noch keine Invite-Links erstellt.';

  return (
    <Layout>
      <div className="page">
        <h1>Invite-Links</h1>
        {tokenList}
      </div>
      <br />
      <button type="button" onClick={() => newTokenMutation.mutate()}>
        Link generieren
      </button>
    </Layout>
  );
};

export default Invites;

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
}) => {
  if (!req.headers.host) {
    throw Error('Could not retrieve base URL for invites page!');
  }
  return {
    props: { inviteLinkBaseUrl: req.headers.host + '/register' },
  };
};
