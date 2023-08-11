import { AddLink, LinkOff } from '@mui/icons-material';
import { Autocomplete, IconButton, Stack, TextField } from '@mui/material';
import { BasicAccordionItem } from 'components/BasicAccordion';
import BasicSelect from 'components/BasicSelect';
import {
  GoogleDriveFileWithSongFileLink,
  LinkType,
  SongFileLink,
} from 'drizzle/models';
import { songLinkTypeOptions } from 'frontend-utils';
import { useEffect, useState } from 'react';

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
        flexWrap={{ xs: 'wrap', md: 'nowrap' }}
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

export default FileLinkForm;

function getPrefillLabel(linkType: LinkType) {
  switch (linkType) {
    case 'AudioInitialNotes':
      return 'Anfangstöne';
    default:
      return '';
  }
}
