import {
  pgTable,
  pgEnum,
  pgSchema,
  AnyPgColumn,
  uniqueIndex,
  serial,
  text,
  timestamp,
  foreignKey,
  integer,
  boolean,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const keyStatus = pgEnum('key_status', [
  'default',
  'valid',
  'invalid',
  'expired',
]);
export const keyType = pgEnum('key_type', [
  'aead-ietf',
  'aead-det',
  'hmacsha512',
  'hmacsha256',
  'auth',
  'shorthash',
  'generichash',
  'kdf',
  'secretbox',
  'secretstream',
  'stream_xchacha20',
]);
export const factorType = pgEnum('factor_type', ['totp', 'webauthn']);
export const factorStatus = pgEnum('factor_status', ['unverified', 'verified']);
export const aalLevel = pgEnum('aal_level', ['aal1', 'aal2', 'aal3']);
export const voiceGroup = pgEnum('VoiceGroup', [
  'S1',
  'S2',
  'S2_M',
  'A1_M',
  'A1',
  'A2',
  'T1',
  'T2',
  'B1',
  'B2',
  'D',
]);
export const codeChallengeMethod = pgEnum('code_challenge_method', [
  's256',
  'plain',
]);
export const linkType = pgEnum('LinkType', [
  'audio',
  'video',
  'pdf',
  'musescore',
]);
export const musicalKey = pgEnum('MusicalKey', [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
]);

import { sql } from 'drizzle-orm';

export const verificationToken = pgTable(
  'VerificationToken',
  {
    id: serial('id').primaryKey().notNull(),
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { precision: 3, mode: 'string' }).notNull(),
  },
  table => {
    return {
      tokenKey: uniqueIndex('VerificationToken_token_key').on(table.token),
      identifierTokenKey: uniqueIndex(
        'VerificationToken_identifier_token_key'
      ).on(table.identifier, table.token),
    };
  }
);

export const user = pgTable(
  'User',
  {
    id: text('id').primaryKey().notNull(),
    firstName: text('firstName').notNull(),
    lastName: text('lastName').notNull(),
    email: text('email'),
    passwordHash: text('passwordHash'),
    emailVerified: timestamp('emailVerified', { precision: 3, mode: 'string' }),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'string' })
      .defaultNow()
      .notNull(),
    image: text('image'),
  },
  table => {
    return {
      emailKey: uniqueIndex('User_email_key').on(table.email),
    };
  }
);

export const account = pgTable(
  'Account',
  {
    id: text('id').primaryKey().notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refreshToken: text('refresh_token'),
    accessToken: text('access_token'),
    expiresAt: integer('expires_at'),
    tokenType: text('token_type'),
    scope: text('scope'),
    idToken: text('id_token'),
    sessionState: text('session_state'),
    oauthTokenSecret: text('oauth_token_secret'),
    oauthToken: text('oauth_token'),
  },
  table => {
    return {
      providerProviderAccountIdKey: uniqueIndex(
        'Account_provider_provider_account_id_key'
      ).on(table.provider, table.providerAccountId),
    };
  }
);

export const session = pgTable(
  'Session',
  {
    id: text('id').primaryKey().notNull(),
    sessionToken: text('session_token').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    expires: timestamp('expires', { precision: 3, mode: 'string' }).notNull(),
  },
  table => {
    return {
      sessionTokenKey: uniqueIndex('Session_session_token_key').on(
        table.sessionToken
      ),
    };
  }
);

export const inviteToken = pgTable(
  'InviteToken',
  {
    id: serial('id').primaryKey().notNull(),
    token: text('token').notNull(),
    used: boolean('used').default(false).notNull(),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'string' })
      .defaultNow()
      .notNull(),
    expires: timestamp('expires', { precision: 3, mode: 'string' }),
    usedAt: timestamp('usedAt', { precision: 3, mode: 'string' }),
    userId: text('user_id').references(() => user.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
  },
  table => {
    return {
      tokenKey: uniqueIndex('InviteToken_token_key').on(table.token),
      userIdKey: uniqueIndex('InviteToken_user_id_key').on(table.userId),
    };
  }
);

export const singer = pgTable(
  'Singer',
  {
    id: text('id').primaryKey().notNull(),
    firstName: text('firstName').notNull(),
    lastName: text('lastName').notNull(),
    email: text('email'),
    createdAt: timestamp('createdAt', { precision: 3, mode: 'string' })
      .defaultNow()
      .notNull(),
    voiceGroup: voiceGroup('voiceGroup').notNull(),
  },
  table => {
    return {
      emailKey: uniqueIndex('Singer_email_key').on(table.email),
    };
  }
);

export const event = pgTable('Event', {
  id: text('id').primaryKey().notNull(),
  summary: text('summary').notNull(),
  description: text('description'),
  location: text('location'),
  lastSyncAt: timestamp('lastSyncAt', {
    precision: 3,
    mode: 'string',
  }).notNull(),
  start: timestamp('start', { precision: 3, mode: 'string' }).notNull(),
  end: timestamp('end', { precision: 3, mode: 'string' }).notNull(),
});

export const setlistSongInfo = pgTable(
  'SetlistSongInfo',
  {
    id: text('id').primaryKey().notNull(),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    setlistId: text('setlist_id')
      .notNull()
      .references(() => setlist.id, { onDelete: 'cascade' }),
    songId: text('song_id')
      .notNull()
      .references(() => song.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    notes: text('notes'),
  },
  table => {
    return {
      setlistIdSongIdOrderKey: uniqueIndex(
        'SetlistSongInfo_setlist_id_song_id_order_key'
      ).on(table.setlistId, table.songId, table.order),
    };
  }
);

export const setlist = pgTable('Setlist', {
  id: text('id').primaryKey().notNull(),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  title: text('title'),
  description: text('description'),
});

export const songFile = pgTable('SongFile', {
  id: text('id').primaryKey().notNull(),
  songId: text('song_id')
    .notNull()
    .references(() => song.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', {
    precision: 6,
    withTimezone: true,
    mode: 'string',
  }).defaultNow(),
  name: text('name'),
  url: text('url'),
  type: linkType('type').notNull(),
});

export const song = pgTable(
  'Song',
  {
    id: text('id').primaryKey().notNull(),
    createdAt: timestamp('created_at', {
      precision: 6,
      withTimezone: true,
      mode: 'string',
    }).defaultNow(),
    title: text('title').notNull(),
    description: text('description'),
    key: musicalKey('key'),
  },
  table => {
    return {
      titleKey: uniqueIndex('Song_title_key').on(table.title),
    };
  }
);

export const eventAttendance = pgTable(
  'EventAttendance',
  {
    singerId: text('singerId')
      .notNull()
      .references(() => singer.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    eventId: text('eventId')
      .notNull()
      .references(() => event.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
  },
  table => {
    return {
      eventAttendancePkey: primaryKey(table.singerId, table.eventId),
    };
  }
);

// relations (atm, they are not created automatically bt drizzle-kit introspect:pg, see also: https://github.com/drizzle-team/drizzle-kit-mirror/issues/83)
