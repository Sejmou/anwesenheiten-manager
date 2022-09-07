import { useRouter } from 'next/router';
import { FormEventHandler, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import {
  Button,
  Card,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { getNonAuthenticatedPageLayout } from '../components/layout/get-page-layouts';
import type { NextPageWithLayout } from './_app';
import PageHead from 'components/PageHead';
import { GetServerSideProps } from 'next';
import prisma from 'lib/prisma';
import Link from 'next/link';

type Props = { noUsersInDB: boolean };
const Login: NextPageWithLayout<Props> = ({ noUsersInDB }: Props) => {
  const router = useRouter();
  const session = useSession();

  if (typeof window !== 'undefined' && session.status === 'authenticated') {
    // redirect user away from this page if already authenticated
    // TODO: figure out if this can be done in cleaner way with middleware, i.e. not delivering this page to clients at all if already authenticated and redirecting instead
    router.replace('/');
  }

  const [error, setError] = useState(false);

  const submitHandler: FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault();
    // TODO: validation logic etc.
    // too lazy to handle form properly at this point, should probably use Formik or something later
    const target = event.target as typeof event.target & {
      email: { value: string };
      password: { value: string };
    };
    const formValue = {
      email: target.email.value,
      password: target.password.value,
    };
    const result = await signIn('credentials', {
      ...formValue,
      redirect: false,
    });
    if (!result || (!result.ok && result?.error)) {
      setError(true);
    } else {
      router.replace('/');
    }
  };

  return (
    <>
      <PageHead
        title="Login"
        description="Login für TU Wien Chor AdministratorInnen"
      />
      <Container
        maxWidth="sm"
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Card sx={{ p: 2, width: '100%' }}>
          <Stack spacing={1}>
            <Typography variant="h4">Login</Typography>
            <Stack
              width="100%"
              spacing={2}
              component="form"
              onSubmit={submitHandler}
            >
              <TextField
                label="E-Mail"
                name="email"
                type="email"
                placeholder="deine.email@tuwien.ac.at"
              />
              <TextField label="Passwort" name="password" type="password" />
              {error && (
                <Typography variant="subtitle1">
                  Login war nicht erfolgreich. Stimmen Email und Passwort?
                </Typography>
              )}
              <Button type="submit">Einloggen</Button>
              {noUsersInDB && (
                <Stack direction="row">
                  <Typography
                    variant="caption"
                    display="flex"
                    alignItems="center"
                  >
                    Noch nicht registriert?
                  </Typography>
                  <Link href="/register">
                    <Button size="small">Registrieren</Button>
                  </Link>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Card>
      </Container>
    </>
  );
};

Login.getLayout = getNonAuthenticatedPageLayout;

export const getServerSideProps: GetServerSideProps<Props> = async context => {
  try {
    const userCount = await prisma.user.count();
    return {
      props: {
        noUsersInDB: userCount == 0,
      },
    };
  } catch (error) {
    console.error(
      'An error occurred while accessing DB before generating login page',
      error
    );
    return {
      props: {
        noUsersInDB: false,
      },
    };
  }
};

export default Login;
