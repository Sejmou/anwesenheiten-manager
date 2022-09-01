import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { FormEventHandler, useState } from 'react';
import { signIn, getSession } from 'next-auth/react';

type Props = {};
const Login: NextPage = (props: Props) => {
  const router = useRouter();
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
    console.log(formValue);
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
      <h1>Login</h1>
      <form onSubmit={submitHandler}>
        <div className="">
          <label>Email</label>
          <input type="email" name="email" />
        </div>
        <div className="">
          <label>Password</label>
          <input type="password" name="password" />
        </div>
        {error && (
          <b>Login war nicht erfolgreich. Stimmen Email und Passwort?</b>
        )}
        <button type="submit">Submit</button>
      </form>
    </>
  );
};
export default Login;

Login.getInitialProps = async ({ res, req }) => {
  const session = await getSession({ req });
  console.log('HERE');

  if (session && res) {
    // redirect user if they are already logged in
    res.writeHead(302, {
      Location: '/',
    });
    res.end();
    return {};
  }

  return {};
};
