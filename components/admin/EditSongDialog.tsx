import { useState } from 'react';
import {
  List,
  ListItem,
  IconButton,
  TextField,
  Stack,
  Typography,
} from '@mui/material';

import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import {
  SongWithAttachments,
  WeblinkAttachment,
  isWeblinkAttachment,
  WeblinkType,
  isFileAttachment,
  webLinkAttachmentTypeValues,
} from 'drizzle/models';
import BasicSelect from '../BasicSelect';
import BasicDialog from 'components/BasicDialog';
import { Formik } from 'formik';
import SongAttachments from 'components/song/Attachments';

export interface EditSongDialogProps {
  open: boolean;
  song: SongWithAttachments;
  onClose: () => void;
}

function EditSongDialog(props: EditSongDialogProps) {
  const { open, onClose, song } = props;
  const { name: songName, attachments } = song;

  const weblinks = attachments.filter(isWeblinkAttachment);
  const files = attachments.filter(isFileAttachment);

  return (
    <BasicDialog
      onClose={onClose}
      open={open}
      fullWidth
      maxWidth="xl"
      title={`${songName}`}
    >
      <Typography variant="h6">Files</Typography>
      {/* TODO: make file attachments editable from here too */}
      <SongAttachments attachments={files} />
      <Typography variant="h6">Weblinks</Typography>
      <List>
        {weblinks.map(link => (
          <ListItem key={link.id}>
            <WeblinkForm variant="existing" link={link} />
          </ListItem>
        ))}
      </List>
    </BasicDialog>
  );
}

type WebLinkFormProps =
  | {
      variant: 'existing';
      link: WeblinkAttachment;
    }
  | {
      variant: 'new';
      songId: string;
    };

const weblinkTypeOptions = webLinkAttachmentTypeValues.map(type => ({
  value: type,
  label: getWeblinkTypeLabel(type),
}));

const WeblinkForm = (props: WebLinkFormProps) => {
  const initialValues: WeblinkAttachment =
    props.variant === 'existing'
      ? props.link
      : {
          label: '',
          type: 'YouTube',
          viewUrl: '',
          downloadUrl: '',
          songId: props.songId,
        };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={values => {
        console.log(values);
      }}
    >
      {({ values, handleChange, handleSubmit }) => (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            width: '100%',
          }}
          alignItems="center"
        >
          <BasicSelect<WeblinkType>
            optionsTypeLabel="Link-Typ"
            value={values.type}
            onChange={handleChange('type')}
            options={weblinkTypeOptions}
          />
          <TextField
            label="Label"
            value={values.label}
            sx={{
              flex: 1,
            }}
            onChange={handleChange('label')}
          />
          <TextField
            label="URL"
            sx={{
              flex: 1,
            }}
            value={values.viewUrl}
            onChange={handleChange('viewUrl')}
          />
          <IconButton sx={{ display: 'block' }} type="submit">
            {props.variant === 'existing' ? (
              <Delete />
            ) : (
              <Add color="primary" />
            )}
          </IconButton>
        </Stack>
      )}
    </Formik>
  );
};

export default EditSongDialog;

function getWeblinkTypeLabel(type: WeblinkType) {
  switch (type) {
    case 'YouTube':
      return 'YouTube-Link';
    case 'Other':
      return 'Diverses';
    default:
      console.warn(
        `Cannot find label mapping for type value '${type}' - using directly as label in UI`
      );
      return type;
  }
}
