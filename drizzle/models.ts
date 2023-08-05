import { InferModel } from 'drizzle-orm';
import { linkType, songFile } from './schema';

export type SongFile = InferModel<typeof songFile, 'insert'>;
export type LinkType = InferModel<typeof songFile>['type'];
export const linkTypeValues = linkType.enumValues;
