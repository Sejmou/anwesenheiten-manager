import { Box, Container } from '@mui/material';
import Image from 'next/image';

type Props = {};
const NonAuthHeader = (props: Props) => {
  return (
    <Box mb={3}>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Container maxWidth="xs">
          <Image
            src="/tu-chor-improv-admin-logo_breit.png"
            alt="TU CHOR Admin Logo"
            layout="responsive"
            width={1064}
            height={358}
          />
        </Container>
      </Box>
    </Box>
  );
};
export default NonAuthHeader;
