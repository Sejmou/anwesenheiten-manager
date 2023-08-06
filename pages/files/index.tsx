import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import { NextPageWithLayout } from 'pages/_app';
import { getAdminPageLayout } from 'components/layout/get-page-layouts';
import AdminPageHead from 'components/layout/AdminPageHead';
import { api } from 'utils/api';
import {
  Autocomplete,
  Button,
  IconButton,
  Link,
  List,
  Stack,
  TextField,
} from '@mui/material';
import { BasicAccordionItem } from 'components/BasicAccordion';
import { GoogleDriveFileWithSongFileLink, LinkType } from 'drizzle/models';
import { useStoreActions } from 'lib/message-store';
import BasicSelect from 'components/BasicSelect';
import { songLinkTypeOptions } from 'frontend-utils';
import { AddLink, LinkOff } from '@mui/icons-material';
import type { SongFileLink } from 'drizzle/models';
import { publicFolderId } from 'utils/google-drive';

const folderUrl = `https://drive.google.com/drive/folders/${publicFolderId}`;

const Files: NextPageWithLayout = () => {
  const addMessage = useStoreActions(actions => actions.addMessage);
  const getSyncedFiles = api.googleDrive.get.useQuery();
  const syncFiles = api.googleDrive.sync.useMutation();
  const getSongs = api.song.getAll.useQuery();
  const addOrUpdateFileLink = api.song.addOrUpdateFileLink.useMutation();
  const removeFileLink = api.song.removeFileLink.useMutation();

  const songs = getSongs?.data?.songs ?? [];
  const files = getSyncedFiles?.data ?? [];

  const handleFileSync = async () => {
    await syncFiles.mutateAsync();
    getSyncedFiles.refetch();
    addMessage('Files synchronisiert!');
  };

  const handleLinkAddOrUpdate = async (newValue: SongFileLink) => {
    await addOrUpdateFileLink.mutateAsync(newValue);
    getSyncedFiles.refetch();
    addMessage('File-Link geupdatet!');
  };

  const handleLinkRemove = async (payload: {
    songId: string;
    label: string;
  }) => {
    await removeFileLink.mutateAsync(payload);
    getSyncedFiles.refetch();
    addMessage('File-Link entfernt!');
  };

  return (
    <>
      <AdminPageHead title="Files" />
      <Typography>
        Hier können Files von{' '}
        <Link href={folderUrl} target="_blank">
          Google Drive
        </Link>{' '}
        mit Liedern im Choir-Repertoire verlinkt werden.
      </Typography>
      {files.length == 0 && (
        <Typography>
          Keine Files gefunden. Entweder ist der Google Drive Ordner leer oder
          die Files wurden noch nicht synchronisiert.
        </Typography>
      )}
      {files.length > 0 && (
        <List>
          {files.map(file => (
            <FileLinkForm
              key={file.id}
              file={file}
              songsToSelectFrom={songs.map(song => ({
                label: song.name,
                id: song.id,
              }))}
              onLinkAddOrUpdate={handleLinkAddOrUpdate}
              onLinkRemove={handleLinkRemove}
              songName={
                songs.find(song => song.id === file?.songFileLink?.songId)?.name
              }
            />
          ))}
        </List>
      )}
      {/* //TODO: this will probably be confusing to users - remove it and setup automated sync instead */}
      <Button sx={{ mt: 2 }} variant="contained" onClick={handleFileSync}>
        Files mit Google Drive synchronisieren
      </Button>
    </>
  );
};

type FileLinkFormProps = {
  file: GoogleDriveFileWithSongFileLink;
  songsToSelectFrom: { label: string | null; id: string }[];
  onLinkAddOrUpdate: (
    newValue: SongFileLink & {
      googleDriveId: string; // this is needed to actually
    }
  ) => void;
  onLinkRemove: (payload: { songId: string; label: string }) => void;
  songName: string | undefined; // this is only used for display purposes (component has no direct access to the song name if a link exists)
};

const FileLinkForm = ({
  file,
  songsToSelectFrom,
  onLinkAddOrUpdate,
  onLinkRemove,
  songName,
}: FileLinkFormProps) => {
  const songFileLink = file.songFileLink;
  const [label, setLabel] = useState(songFileLink?.label ?? '');
  const [type, setType] = useState<LinkType>(songFileLink?.type ?? 'Audio');
  const [songId, setSongId] = useState<string | null>(
    songFileLink?.songId ?? null
  );

  const dataValid = label.length > 0 && type.length > 0 && songId !== null;
  const buttonDisabled = !dataValid && !songFileLink; // you can remove an existing link regardless of data validity, but never add one if data is invalid

  const handleButtonClick = () => {
    if (songFileLink) {
      onLinkRemove({
        songId: songFileLink.songId,
        label: songFileLink.label,
      });
    } else {
      if (dataValid) {
        onLinkAddOrUpdate({
          label,
          type,
          songId,
          url: file.downloadUrl,
          googleDriveId: file.id,
        });
      }
    }
  };

  // prefill the label with a sensible default after the user selects a link type
  useEffect(() => {
    if (!label) {
      setLabel(getPrefillLabel(type));
    }
  }, [label, type]);

  return (
    <BasicAccordionItem
      primaryText={file.name}
      secondaryText={
        songName
          ? `✅ Verlinkt mit '${songName}'`
          : '❌ Mit keinem Lied verlinkt'
      }
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          width: '100%',
        }}
        alignItems="center"
      >
        <Autocomplete
          options={songsToSelectFrom}
          sx={{ minWidth: 300 }}
          renderInput={params => (
            <TextField
              {...params}
              label="Verlinktes Lied"
              placeholder="Wähle ein Lied aus dem Repertoire"
              variant="outlined"
            />
          )}
          value={songsToSelectFrom.find(song => song.id === songId) ?? null}
          onChange={(event, value) => {
            setSongId(value?.id ?? null);
          }}
        />
        <BasicSelect<LinkType>
          optionsTypeLabel="Link-Typ"
          value={type}
          onChange={newType => setType(newType)}
          options={songLinkTypeOptions}
        />
        <TextField
          label="Link-Label"
          value={label}
          sx={{
            flex: 1,
          }}
          onChange={e => setLabel(e.target.value)}
        />
        <IconButton
          color={songFileLink ? 'error' : 'primary'}
          disabled={buttonDisabled}
          onClick={handleButtonClick}
        >
          {songFileLink ? (
            <LinkOff />
          ) : (
            <AddLink color={buttonDisabled ? 'disabled' : 'primary'} />
          )}
        </IconButton>
      </Stack>
    </BasicAccordionItem>
  );
};

function getPrefillLabel(linkType: LinkType) {
  switch (linkType) {
    case 'AudioInitialNotes':
      return 'Anfangstöne';
    default:
      return '';
  }
}

Files.getLayout = getAdminPageLayout;

export default Files;
