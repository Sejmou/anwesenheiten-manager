import { Box, Container, Typography } from '@mui/material';
import Image from 'next/image';

type Props = {};
const NonAuthHeader = (props: Props) => {
  return (
    <Box my={2}>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Container maxWidth="xs">
          <Image
            src="/tu-chor-logo_breit.png"
            layout="responsive"
            width={1064}
            height={358}
          />
        </Container>
      </Box>
      <Typography variant="h4" align="center">
        Anwesenheitslisten-Manager
      </Typography>
    </Box>
  );
};
export default NonAuthHeader;
