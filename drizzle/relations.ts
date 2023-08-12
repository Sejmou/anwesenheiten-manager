// drizzle-kit generate:pg does NOT generate relations for some reason (see also: https://github.com/drizzle-team/drizzle-kit-mirror/issues/83)
// that's why I add them here manually as needed
import { relations } from 'drizzle-orm';
import {
  song,
  songAttachment,
  setlist,
  setlistSongInfo,
  googleDriveFile,
} from 'drizzle/schema';

export const songRelations = relations(song, ({ many }) => ({
  attachments: many(songAttachment),
  setlistSongInfo: many(setlistSongInfo),
}));

export const songAttachmentRelations = relations(songAttachment, ({ one }) => ({
  song: one(song, {
    fields: [songAttachment.songId],
    references: [song.id],
  }),
}));

export const googleDriveFileRelations = relations(
  googleDriveFile,
  ({ one }) => ({
    attachment: one(songAttachment, {
      fields: [googleDriveFile.attachmentId],
      references: [songAttachment.id],
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
