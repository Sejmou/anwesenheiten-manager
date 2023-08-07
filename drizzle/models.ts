import { InferModel } from 'drizzle-orm';
import {
  googleDriveFile,
  linkType,
  setlist,
  song,
  songFileLink,
} from './schema';

export type SongFileLink = InferModel<typeof songFileLink, 'insert'>;
export type LinkType = InferModel<typeof songFileLink>['type'];
export const linkTypeValues = linkType.enumValues;

export type Song = InferModel<typeof song>;

export type Setlist = InferModel<typeof setlist>;

export type SongWithFileLinks = Song & {
  fileLinks: Array<SongFileLink>;
};

export type GoogleDriveFile = InferModel<typeof googleDriveFile>;
export type GoogleDriveFileWithSongFileLink = GoogleDriveFile & {
  songFileLink?: SongFileLink; // TODO: figure out how to model optional relationship in drizzle/relations.ts
};
export type NewGoogleDriveFile = InferModel<typeof googleDriveFile, 'insert'>;
