import { NextPage } from 'next';
import Layout from '../../components/Layout';

type Props = {};
const Proben: NextPage<Props> = () => {
  return (
    <Layout>
      <div>
        <h1>Proben</h1>
        <div></div>
        <form action="">
          <input type="datetime" name="start" id="start" />
          <input type="datetime" name="end" id="end" />
          <button type="submit">Neue Probe anlegen</button>
        </form>
      </div>
    </Layout>
  );
};
export default Proben;
