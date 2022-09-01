import React from 'react';
import { GetServerSideProps } from 'next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InviteToken } from '../api/invite-tokens';
import { Box, Button, Grid, Typography } from '@mui/material';
import ResponsiveContainer from '../../components/layout/ResponsiveContainer';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Admin } from '../api/admins';
import { NextPageWithLayout } from '../_app';
import { getAuthenticatedPageLayout } from '../../components/layout/get-page-layouts';

type Props = { inviteLinkBaseUrl: string };

const adminTableCols: GridColDef[] = [
  { field: 'firstName', headerName: 'Vorname' },
  { field: 'secondName', headerName: 'Nachname' },
  { field: 'email', headerName: 'Email' },
  { field: 'createdAt', headerName: 'Beigetreten am' },
];

const getAvailableTokens = () =>
  fetch('/api/invite-tokens?available').then(data => data.json());
const generateToken = () => fetch('/api/invite-tokens', { method: 'POST' });
const getAdminRows = () =>
  fetch('/api/admins')
    .then(data => data.json() as Promise<Admin[]>)
    .then(admins => admins.map((admin, i) => ({ ...admin, id: i })));

const Admins: NextPageWithLayout<Props> = ({ inviteLinkBaseUrl }: Props) => {
  const { data: tokens, isLoading: tokensLoading } = useQuery<InviteToken[]>(
    ['tokens'],
    getAvailableTokens,
    {
      initialData: [],
    }
  );
  const { data: admins, isLoading: adminsLoading } = useQuery<Admin[]>(
    ['admins'],
    getAdminRows,
    {
      initialData: [],
    }
  );

  const client = useQueryClient();

  const newTokenMutation = useMutation(generateToken, {
    onSuccess: () => client.invalidateQueries(['tokens']),
  });

  const invitesList = tokensLoading ? (
    'Lade Daten...'
  ) : tokens.length > 0 ? (
    <Grid container spacing={1} padding={1}>
      {tokens.map(t => (
        <>
          <Grid
            item
            // xs={8}
            sx={{ whiteSpace: 'nowrap', overflowX: 'auto' }}
          >
            <Typography>{`${inviteLinkBaseUrl}?token=${t.token}`}</Typography>
          </Grid>
          {/* <Grid item xs={4}>
            <Typography sx={{ whiteSpace: 'nowrap' }}>
              {!t.used
                ? 'noch nicht verwendet'
                : `verwendet von ${t.usedBy?.name}, (${t.usedBy?.email})`}
            </Typography>
          </Grid> */}
        </>
      ))}
    </Grid>
  ) : (
    'Es gibt keine noch nicht eingelösten Links.'
  );

  return (
    <>
      <Box>
        <Typography variant="body1">
          Diese Seite dient dem Verwalten der Admins für diese Website.
        </Typography>
        <Typography variant="body1">
          Ein paar wichtige Features fehlen noch. Sie kommen noch, irgendwann :)
        </Typography>
        {adminsLoading ? (
          'Lade Admin-Daten...'
        ) : (
          <>
            {/*Note: hideFooter hides pagination too */}
            <Typography>Admins</Typography>
            <DataGrid columns={adminTableCols} rows={admins} hideFooter />
          </>
        )}
        <ResponsiveContainer title="Offene Invites">
          {invitesList}
        </ResponsiveContainer>
      </Box>
      <Button onClick={() => newTokenMutation.mutate()}>
        Neuen Link generieren
      </Button>
    </>
  );
};

Admins.getLayout = getAuthenticatedPageLayout;

export default Admins;

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
