// drizzle-kit generate:pg does NOT generate relations for some reason (see also: https://github.com/drizzle-team/drizzle-kit-mirror/issues/83)
// that's why I add them here manually as needed
import { relations } from 'drizzle-orm';
import { song, songFile, setlist, setlistSongInfo } from 'drizzle/schema';

export const songsRelations = relations(song, ({ many }) => ({
  files: many(songFile),
}));

export const songFilesRelations = relations(songFile, ({ one }) => ({
  song: one(song, {
    fields: [songFile.songId],
    references: [song.id],
  }),
}));

// couldn't get this many-to-many relation to work
// export const setlistSongsRelations = relations(setlist, ({ many }) => ({
//   songs: many(song),
// }));

// export const songSetlistsRelations = relations(song, ({ many }) => ({
//   setlists: many(setlist),
// }));

// export const setlistsToSongsRelations = relations(
//   setlistSongInfo,
//   ({ one }) => ({
//     setlist: one(setlist, {
//       fields: [setlistSongInfo.setlistId],
//       references: [setlist.id],
//     }),
//     song: one(song, {
//       fields: [setlistSongInfo.songId],
//       references: [song.id],
//     }),
//   })
// );
