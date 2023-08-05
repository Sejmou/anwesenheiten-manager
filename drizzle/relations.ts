// drizzle-kit generate:pg does NOT generate relations for some reason (see also: https://github.com/drizzle-team/drizzle-kit-mirror/issues/83)
// that's why I add them here manually as needed
import { relations } from 'drizzle-orm';
import { song, songFile } from 'drizzle/schema';

export const songsRelations = relations(song, ({ many }) => ({
  files: many(songFile),
}));

export const songFilesRelations = relations(songFile, ({ one }) => ({
  song: one(song, {
    fields: [songFile.songId],
    references: [song.id],
  }),
}));
