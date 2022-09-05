import React from 'react';
import { GetServerSideProps } from 'next';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryFunction,
} from '@tanstack/react-query';
import { InviteToken } from '../api/invite-tokens';
import { Button, Stack, Typography } from '@mui/material';
import ResponsiveContainer from '../../components/layout/ResponsiveContainer';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import { Admin } from '../api/admins';
import { NextPageWithLayout } from '../_app';
import { getAuthenticatedPageLayout } from '../../components/layout/get-page-layouts';
import CopyableLink from '../../components/CopyableLink';

type Props = { inviteLinkBaseUrl: string };

const adminTableCols: GridColDef[] = [
  { field: 'firstName', headerName: 'Vorname', flex: 1 },
  { field: 'lastName', headerName: 'Nachname', flex: 1 },
  { field: 'email', headerName: 'Email', flex: 1 },
  {
    field: 'createdAt',
    headerName: 'Beitrittsdatum',
    flex: 1,
    valueFormatter: (params: GridValueFormatterParams<Date>) => {
      if (params.value == null) {
        return '';
      }

      const date = new Date(params.value);

      const valueFormatted = date.toLocaleString('de-AT');
      return valueFormatted;
    },
  },
];

type InviteLinkTableRow = Pick<InviteToken, 'createdAt'> & {
  link: string;
  id: number;
};

type InviteLinkTableColDef = GridColDef & {
  field: keyof InviteLinkTableRow;
};

const inviteLinkTableCols: InviteLinkTableColDef[] = [
  {
    field: 'link',
    headerName: 'Link',
    flex: 1.8,
    renderCell: (params: GridRenderCellParams<string>) => {
      if (params.value == null) {
        return '';
      }
      return (
        <CopyableLink
          link={params.value}
          message="Link wurde in die Zwischenablage kopiert!"
        />
      );
    },
  },
  {
    field: 'createdAt',
    headerName: 'Erstellungsdatum',
    flex: 1,
    valueFormatter: (params: GridValueFormatterParams<Date>) => {
      if (params.value == null) {
        return '';
      }

      const date = new Date(params.value);

      const valueFormatted = date.toLocaleString('de-AT');
      return valueFormatted;
    },
  },
];

const getInviteLinkRows: QueryFunction<InviteLinkTableRow[]> = ({ queryKey }) =>
  fetch('/api/invite-tokens?available')
    .then(data => data.json() as Promise<InviteToken[]>)
    .then(tokens =>
      tokens.map((t, i) => ({
        link: `${queryKey[1]}?token=${t.token}`, // second el. in queryKey is the base URL to use for the link
        createdAt: t.createdAt,
        id: i,
      }))
    );

const generateToken = () => fetch('/api/invite-tokens', { method: 'POST' });
const getAdminRows: QueryFunction<Admin[]> = () =>
  fetch('/api/admins')
    .then(data => data.json() as Promise<Admin[]>)
    .then(admins =>
      admins.map((admin, i) => ({
        ...admin,
        id: i,
      }))
    );

const Admins: NextPageWithLayout<Props> = ({ inviteLinkBaseUrl }: Props) => {
  const { data: inviteLinks, isLoading: inviteLinksLoading } = useQuery<
    InviteLinkTableRow[]
  >(['tokens', inviteLinkBaseUrl], getInviteLinkRows, {
    initialData: [],
  });
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

  const invitesList = inviteLinksLoading ? (
    'Lade Daten...'
  ) : inviteLinks.length > 0 ? (
    <DataGrid
      autoHeight
      columns={inviteLinkTableCols}
      rows={inviteLinks}
      hideFooter
    />
  ) : (
    <Typography py={2} px={1}>
      Es gibt keine noch nicht eingelösten Links.
    </Typography>
  );

  return (
    <>
      <Stack>
        <Typography variant="body1">
          Diese Seite dient dem Verwalten der Admins für diese Website.
        </Typography>
        <Typography variant="body1">
          Ein paar wichtige Features fehlen noch. Sie kommen, irgendwann :)
        </Typography>
        <Stack mt={2} spacing={{ xs: 0, md: 2 }}>
          {adminsLoading ? (
            'Lade Admin-Daten...'
          ) : (
            <ResponsiveContainer title="Admins">
              <DataGrid
                autoHeight
                columns={adminTableCols}
                rows={admins}
                hideFooter
              />
            </ResponsiveContainer>
          )}
          <ResponsiveContainer title="Ungenutzte Invite-Links">
            {invitesList}
          </ResponsiveContainer>
        </Stack>
      </Stack>
      <Button onClick={() => newTokenMutation.mutate()}>
        Neuen Link generieren
      </Button>
    </>
  );
};

Admins.getLayout = getAuthenticatedPageLayout;

export default Admins;

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  const { req } = context;
  if (!req.headers.host) {
    throw Error('Could not retrieve base URL for invites page!');
  }
  return {
    props: { inviteLinkBaseUrl: req.headers.host + '/register' },
  };
};
