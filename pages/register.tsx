import { NextPage } from 'next';
import { FormEventHandler } from 'react';

type Props = {};
const Register: NextPage = (props: Props) => {
  const submitHandler: FormEventHandler<HTMLFormElement> = event => {
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
    fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(formValue),
    });
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
        <button type="submit">Submit</button>
      </form>
    </>
  );
};
export default Register;

function getFormElementValue(form: HTMLFormElement, name: string) {
  return form[name].value;
}
