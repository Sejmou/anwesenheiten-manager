import React from 'react';
import Typography from '@mui/material/Typography';
import { NextPageWithLayout } from '../_app';
import { getAuthenticatedPageLayout } from '../../components/layout/get-page-layouts';
import CustomDropzone from '../../components/Dropzone';

const Members: NextPageWithLayout = () => {
  return (
    <>
      <Typography variant="body1">
        Auf dieser Seite wird es bald die Möglichkeit geben, Chormitglieder
        hinzuzufügen und ggf. zu bearbeiten und Statistiken etc. einzusehen.
      </Typography>
      <CustomDropzone
        text="CSV hochladen (hier klicken oder hineinziehen)"
        dragText="Einfach loslassen :)"
        fileTypesAndExtensions={{ 'text/csv': ['.csv'] }}
      />
    </>
  );
};

Members.getLayout = getAuthenticatedPageLayout;

export default Members;
