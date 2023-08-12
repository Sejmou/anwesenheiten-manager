import { GridValueFormatterParams } from '@mui/x-data-grid';
import { VoiceGroup } from '@prisma/client';

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
  ['Anhang']: string;
};

const mappings: GermanSingularToPluralMappings = {
  ['Lied']: 'Lieder',
  ['File']: 'Files',
  ['Probe']: 'Proben',
  ['Anhang']: 'Anhänge',
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
