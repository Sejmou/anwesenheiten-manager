import { InferModel } from 'drizzle-orm';
import { linkType, setlist, song, songFile } from './schema';

export type SongFile = InferModel<typeof songFile, 'insert'>;
export type LinkType = InferModel<typeof songFile>['type'];
export const linkTypeValues = linkType.enumValues;

export type Song = InferModel<typeof song>;

export type Setlist = InferModel<typeof setlist>;
