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
      name: { value: string };
      password: { value: string };
    };
    const formValue = {
      name: target.name.value,
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
    console.log('here');
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
        console.log(signInRes);
        router.replace('/');
      }, 2500);
    }
  };

  return (
    <>
      <h1>Registrierung</h1>
      <form onSubmit={submitHandler}>
        <div className="">
          <label>Name</label>
          <input type="text" name="name" />
        </div>
        <div className="">
          <label>Email</label>
          <input type="email" name="email" />
        </div>
        <div className="">
          <label>Password</label>
          <input type="password" name="password" />
        </div>
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
