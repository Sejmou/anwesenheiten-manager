import { GridValueFormatterParams } from '@mui/x-data-grid';
import { VoiceGroup } from '@prisma/client';
import { SongFileLink, linkTypeValues } from 'drizzle/models';

export const VoiceGroupToDescriptionString: { [voiceGroup: string]: string } = {
  S1: 'Sopran 1',
  S2: 'Sopran 2',
  S2_M: 'Sopran 2/Mezzo',
  A1_M: 'Alt 1/Mezzo',
  A1: 'Alt 1',
  A2: 'Alt 2',
  T1: 'Tenor 1',
  T2: 'Tenor 2',
  B1: 'Bass 1',
  B2: 'Bass 2',
  D: 'Dirigent',
};

export function voiceGroupGridValueFormatter(
  params: GridValueFormatterParams<VoiceGroup>
) {
  if (!params.value) return '-';
  return VoiceGroupToDescriptionString[params.value] ?? '-';
}

type GermanSingularToPluralMappings = {
  ['Lied']: string;
  ['File']: string;
  ['Probe']: string;
};

const mappings: GermanSingularToPluralMappings = {
  ['Lied']: 'Lieder',
  ['File']: 'Files',
  ['Probe']: 'Proben',
};

type WordInSingular = keyof GermanSingularToPluralMappings;

export function singularPluralAutoFormat<T>(
  array: Array<T>,
  wordInSingular: WordInSingular
) {
  if (array.length === 1) {
    return `${array.length} ${wordInSingular}`;
  }
  return `${array.length} ${mappings[wordInSingular]}`;
}

function getLabelForSongFileLinkType(type: SongFileLink['type']) {
  switch (type) {
    case 'Audio':
      return 'Audio (allgemein)';
    case 'AudioInitialNotes':
      return 'Anfangstöne';
    case 'AudioPracticeTrack':
      return 'Übungstrack';
    case 'AudioRecording':
      return 'Aufnahme';
    case 'PDF':
      return 'PDF';
    case 'Video':
      return 'Video';
    case 'MuseScore':
      return 'MuseScore';
    case 'Other':
      return 'Diverses';
    default:
      console.warn(
        `Cannot find label for SongFileLink link type '${type}' - using as label in UI`
      );
      return type;
  }
}

export const songLinkTypeOptions = linkTypeValues
  .map(type => ({
    label: getLabelForSongFileLinkType(type),
    value: type,
  }))
  .sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()));
