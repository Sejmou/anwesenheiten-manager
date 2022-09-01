import { Box, Typography } from '@mui/material';
import { NextPage } from 'next';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FormEventHandler, useState } from 'react';
import { RegistrationData } from './api/register';

type Props = {};
const Register: NextPage = (props: Props) => {
  const router = useRouter();
  const session = useSession();

  if (typeof window !== 'undefined' && !session) {
    // this should only run on client, not during SSR/SSG
    // TODO: figure out if this can be done in cleaner way with middleware, i.e. not delivering this page to clients at all if already authenticated and redirecting instead
    router.replace('/');
  }

  const inviteToken = router.query.token;
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
    const registrationData: RegistrationData =
      inviteToken && typeof inviteToken === 'string'
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
        router.replace('/');
      }, 2500);
    }
  };

  return (
    <>
      <Typography variant="h2">Registrierung</Typography>
      <form onSubmit={submitHandler}>
        <Box>
          <label>Vorname</label>
          <input type="text" name="firstName" />
        </Box>
        <Box>
          <label>Nachname</label>
          <input type="text" name="lastName" />
        </Box>
        <Box>
          <label>Email</label>
          <input type="email" name="email" />
        </Box>
        <Box>
          <label>Passwort</label>
          <input type="password" name="password" />
        </Box>
        {error && <b>Registrierung fehlgeschlagen.</b>}
        <button type="submit">Submit</button>
        {success && (
          <b>Registrierung erfolgreich! Du wirst in Kürze weitergeleitet...</b>
        )}
      </form>
    </>
  );
};
export default Register;
