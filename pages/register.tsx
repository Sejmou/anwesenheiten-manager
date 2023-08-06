import {
  Button,
  Card,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AdminPageHead from 'components/layout/AdminPageHead';
import { GetServerSideProps } from 'next';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { FormEventHandler, useState } from 'react';
import { getAdminAuthPageLayout } from '../components/layout/get-page-layouts';
import prisma from '../lib/prisma';
import { RegistrationData } from 'pages/api/register';
import { NextPageWithLayout } from './_app';

type Props = { inviteToken: string | null };
const Register: NextPageWithLayout<Props> = ({ inviteToken }: Props) => {
  const router = useRouter();
  const session = useSession();

  if (typeof window !== 'undefined' && session.status === 'authenticated') {
    // redirect user away from this page if already authenticated
    // TODO: figure out if this can be done in cleaner way with middleware, i.e. not delivering this page to clients at all if already authenticated and redirecting instead
    router.replace('/');
  }
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitHandler: FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault();
    // TODO: validation logic etc.
    // too lazy to handle form properly at this point, should probably use Formik or something later
    const target = event.target as typeof event.target & {
      email: { value: string };
      firstName: { value: string };
      lastName: { value: string };
      password: { value: string };
    };
    const formValue = {
      firstName: target.firstName.value,
      lastName: target.lastName.value,
      email: target.email.value,
      password: target.password.value,
    };
    const registrationData: RegistrationData = !!inviteToken
      ? { ...formValue, inviteToken }
      : formValue;

    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
    if (!res.ok) {
      setError(true);
    } else {
      setError(false);
      setSuccess(true);
      // for some reason we can't sign in right away after registering, so we introduce an aritifical delay
      // TODO: investigate timing issue with registration further
      setTimeout(async () => {
        const signInRes = await signIn('credentials', {
          email: registrationData.email,
          password: registrationData.password,
          redirect: false,
        });
        if (signInRes?.ok) router.replace('/');
        else console.error(signInRes);
      }, 2500);
    }
  };

  return (
    <>
      <AdminPageHead title="Registrierung" />
      <Container
        maxWidth="sm"
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Card sx={{ p: 2, width: '100%' }}>
          <Stack spacing={1}>
            <Typography variant="h4">Registrierung</Typography>
            <Stack
              width="100%"
              spacing={2}
              component="form"
              onSubmit={submitHandler}
            >
              <TextField label="Vorname" name="firstName" />
              <TextField label="Nachname" name="lastName" />
              <TextField
                label="E-Mail"
                name="email"
                type="email"
                placeholder="deine.email@tuwien.ac.at"
              />
              <TextField label="Passwort" type="password" name="password" />
              {error && (
                <Typography variant="subtitle1">
                  Registrierung fehlgeschlagen :/
                </Typography>
              )}
              {success && (
                <Typography variant="subtitle1">
                  Registrierung erfolgreich! Du wirst in Kürze weitergeleitet...
                </Typography>
              )}
              <Button type="submit">Registrieren</Button>
              <Stack direction="row">
                <Typography
                  variant="caption"
                  display="flex"
                  alignItems="center"
                >
                  Bereits registriert?
                </Typography>
                <Link href="/login">
                  <Button size="small">Zum Login</Button>
                </Link>
              </Stack>
            </Stack>
          </Stack>
        </Card>
      </Container>
    </>
  );
};

Register.getLayout = getAdminAuthPageLayout;

export default Register;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const redirect = {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
  if ((await prisma.user.count()) == 0) return { props: { inviteToken: null } };
  const token = await getValidatedToken(query);
  if (!token) {
    return redirect;
  }
  return { props: { inviteToken: token } };
};

async function getValidatedToken(query: ParsedUrlQuery) {
  if (typeof query.token !== 'string' || !query.token) {
    return false;
  }

  const token = query.token;

  try {
    const tokenInDB = await prisma.inviteToken.findFirstOrThrow({
      where: { token },
    });
    if (tokenInDB.used) {
      // token already used!
      return;
    }
    return token;
  } catch (error) {
    // token invalid
    return;
  }
}
