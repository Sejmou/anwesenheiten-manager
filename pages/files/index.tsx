import Typography from '@mui/material/Typography';
import { NextPageWithLayout } from 'pages/_app';
import { getAdminPageLayout } from 'components/layout/get-page-layouts';
import AdminPageHead from 'components/layout/AdminPageHead';
import { Box, Button, Link } from '@mui/material';
import { publicFolderId } from 'utils/google-drive';
import DriveFileSongLinkCreator from 'components/admin/DriveFileSongLinkCreator.tsx';
import { useState } from 'react';

const folderUrl = `https://drive.google.com/drive/folders/${publicFolderId}`;

const Files: NextPageWithLayout = () => {
  const [showLinkCreator, setShowLinkCreator] = useState(false);

  return (
    <>
      <AdminPageHead title="Files" />
      <Box
        sx={{
          margin: 'auto',
        }}
      >
        <Typography maxWidth="md">
          Auf dieser Seite können (mit maschineller Unterstützung) Links
          zwischen Files aus Ordnern auf{' '}
          <Link href={folderUrl} target="_blank">
            Google Drive
          </Link>{' '}
          und Liedern im Choir-Repertoire erstellt werden.
        </Typography>

        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => setShowLinkCreator(true)}
        >
          Los geht's!
        </Button>
      </Box>
      {showLinkCreator && (
        <DriveFileSongLinkCreator onClose={() => setShowLinkCreator(false)} />
      )}
    </>
  );
};

Files.getLayout = getAdminPageLayout;

export default Files;
