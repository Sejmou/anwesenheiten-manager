// drizzle-kit generate:pg does NOT generate relations for some reason (see also: https://github.com/drizzle-team/drizzle-kit-mirror/issues/83)
// that's why I add them here manually as needed
import { relations } from 'drizzle-orm';
import {
  song,
  songFileLink,
  setlist,
  setlistSongInfo,
  googleDriveFile,
} from 'drizzle/schema';

export const songRelations = relations(song, ({ many }) => ({
  fileLinks: many(songFileLink),
  setlistSongInfo: many(setlistSongInfo),
}));

export const songFileLinkRelations = relations(songFileLink, ({ one }) => ({
  song: one(song, {
    fields: [songFileLink.songId],
    references: [song.id],
  }),
}));

export const googleDriveFileRelations = relations(
  googleDriveFile,
  ({ one }) => ({
    // TODO: this relation is optional! research how an optional relation can be modeled
    songFileLink: one(songFileLink, {
      fields: [googleDriveFile.downloadUrl],
      references: [songFileLink.url],
    }),
  })
);

export const setlistRelations = relations(setlist, ({ many }) => ({
  setlistSongInfo: many(setlistSongInfo),
}));

export const setlistsToSongsRelations = relations(
  setlistSongInfo,
  ({ one }) => ({
    setlist: one(setlist, {
      fields: [setlistSongInfo.setlistId],
      references: [setlist.id],
    }),
    song: one(song, {
      fields: [setlistSongInfo.songId],
      references: [song.id],
    }),
  })
);
