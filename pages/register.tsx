import { NextPage } from 'next';
import { getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FormEventHandler, useState } from 'react';

type Props = {};
const Register: NextPage = (props: Props) => {
  const router = useRouter();
  const [error, setError] = useState(false);

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
    console.log(formValue);
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(formValue),
    });
    if (!res.ok) {
      setError(true);
    } else {
      setError(false);
      router.replace('/');
    }
  };

  return (
    <>
      <h1>Register</h1>
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
        {error && <b>Signup failed. Please try again</b>}
        <button type="submit">Submit</button>
      </form>
    </>
  );
};
export default Register;

Register.getInitialProps = async ({ res, req }) => {
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
