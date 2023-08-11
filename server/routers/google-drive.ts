import { z } from 'zod';
import { publicProcedure, createTRPCRouter, protectedProcedure } from '../trpc';
import { googleDriveFile, songFileLink, song } from 'drizzle/schema';
import { createInsertSchema } from 'drizzle-zod';
import { NewGoogleDriveFile } from 'drizzle/models';
import { type DrizzleDBClient } from 'server/db';
import { SQL, eq, inArray, sql } from 'drizzle-orm';
import { google } from 'googleapis';
import { PgDialect } from 'drizzle-orm/pg-core';

const pgDialect = new PgDialect();

const getGoogleAPIKey = () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('No Google API key found');
  }
  return process.env.GOOGLE_API_KEY;
};

const createDriveAPI = (apiKey: string) => {
  return google.drive({ version: 'v3', auth: apiKey });
};
type DriveAPI = ReturnType<typeof createDriveAPI>;

const GOOGLE_API_KEY = getGoogleAPIKey();
const drive = createDriveAPI(GOOGLE_API_KEY);

const folderContentsAPIResponse = z.object({
  files: z.array(
    z.object({
      name: z.string(),
      id: z.string(),
    })
  ),
});

const fileMetadataAPIResponse = z.object({
  webContentLink: z.string().url().optional(),
  mimeType: z.string(),
  name: z.string(),
});

// Google Drive API files aren't necessarily actual files, hence I am making this distinction here
type DriveAPIItem = Awaited<ReturnType<typeof getMetadataForGoogleDriveId>>;
type DriveAPIFile = Required<DriveAPIItem>;
type GoogleDriveFolder = {
  id: string;
  name: string;
  subfolders: GoogleDriveFolder[];
};

const googleDriveFileInput = createInsertSchema(googleDriveFile);

export const googleDriveRouter = createTRPCRouter({
  getLinkedFiles: publicProcedure.query(async ({ ctx }) => {
    const files = await ctx.db.query.googleDriveFile.findMany({
      orderBy: f => f.name,
      with: {
        songFileLink: true,
      },
    });
    return files;
  }),
  addOrUpdateFile: protectedProcedure
    .input(googleDriveFileInput)
    .mutation(async ({ ctx, input }) => {
      const file = await storeInDb(input, ctx.db);
      return file;
    }),
  getFolderWithAllSubfolders: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const folder = await createGoogleDriveFolderTree(input, drive);
      return folder;
    }),
  getFilesForFolder: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const files = await getFilesInFolder(input);
      const queryResult = await ctx.db
        .select({
          id: googleDriveFile.id,
          songId: songFileLink.songId,
          linkLabel: songFileLink.label,
        })
        .from(googleDriveFile)
        .where(
          inArray(
            googleDriveFile.id,
            files.map(f => f.id)
          )
        )
        .leftJoin(
          songFileLink,
          eq(googleDriveFile.downloadUrl, songFileLink.url)
        );

      const existingFileIds = new Set(queryResult.map(f => f.id));
      const existingSongLinks = queryResult.filter(
        f => f.songId !== null && f.linkLabel !== null
      ) as { id: string; songId: string; linkLabel: string }[];
      const songLinksMap = new Map(
        existingSongLinks.map(f => [
          f.id,
          {
            songId: f.songId,
            label: f.linkLabel,
          },
        ])
      );

      const filesWithInfo = files.map(f => ({
        ...f,
        existsInDB: existingFileIds.has(f.id),
        songLink: songLinksMap.get(f.id),
      }));
      return filesWithInfo;
    }),
  getSongMatchesForSubfolderNames: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { name } = await getMetadataForGoogleDriveId(input);
      const folder = await getFolderWithSubfolders(input, drive, name);

      const subfolderNames = folder.subfolders.map(f => f.name);
      const subFolderIds = folder.subfolders.map(f => f.id);
      const matches = await fuzzyMatchSongs(subfolderNames, ctx.db);

      const songNames = matches.map(m => m.closestMatch);
      const songs = await ctx.db
        .select()
        .from(song)
        .where(inArray(song.name, songNames));

      const songMap = new Map(songs.map(s => [s.name, s]));

      const songMatches = matches.map((m, i) => ({
        name: m.inputString,
        id: subFolderIds[i],
        closestMatch: m.closestMatch,
        song: songMap.get(m.closestMatch)!,
      }));
      return songMatches;
    }),
});

function driveFileToDBFile(file: DriveAPIFile): NewGoogleDriveFile {
  const { id, webContentLink: downloadUrl, mimeType, name } = file;
  return {
    id,
    downloadUrl,
    mimeType,
    name,
    lastSyncAt: new Date(),
  };
}

async function createGoogleDriveFolderTree(folderId: string, drive: DriveAPI) {
  const { name } = await getMetadataForGoogleDriveId(folderId);
  const folder = await getFolderWithSubfolders(folderId, drive, name, true);
  return folder;
}

async function getFolderWithSubfolders(
  folderId: string,
  drive: DriveAPI,
  folderName: string = 'root',
  recursive = false
): Promise<GoogleDriveFolder> {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });
  const resp = folderContentsAPIResponse.parse(res.data);
  const subfolders = resp.files;
  if (subfolders.length === 0) {
    return { name: folderName, id: folderId, subfolders: [] };
  }
  if (recursive) {
    const subfolderResults = await Promise.all(
      subfolders.map(async subfolder =>
        getFolderWithSubfolders(subfolder.id, drive, subfolder.name)
      )
    );
    return {
      name: folderName,
      id: folderId,
      subfolders: subfolderResults,
    };
  } else {
    return {
      name: folderName,
      id: folderId,
      subfolders: subfolders.map(f => ({
        name: f.name,
        id: f.id,
        subfolders: [],
      })),
    };
  }
}

async function getFilesInFolder(
  folderId: string,
  recursive = false,
  relPath = ''
) {
  const folderFilesApiRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q="${folderId}"+in+parents&key=${GOOGLE_API_KEY}` // try fetching data about Google Drive folder
  );
  const anyResponse = await folderFilesApiRes.json();
  const response = folderContentsAPIResponse.parse(anyResponse);
  const folderContents = response.files.map(f => ({
    name: f.name,
    id: f.id,
  }));
  if (folderContents.length === 0) {
    return [];
  }

  const files: (NewGoogleDriveFile & { path: string })[] = [];
  for (const item of folderContents) {
    // proper files have webContentLink, folders don't
    const { webContentLink, ...rest } = await getMetadataForGoogleDriveId(
      item.id
    );
    if (webContentLink) {
      const file = driveFileToDBFile({
        ...rest,
        webContentLink,
      });
      files.push({ ...file, path: constructRelativePath(relPath, item.name) });
    } else {
      // probably we are dealing with a folder, but let's check
      const mimeType = rest.mimeType;
      if (mimeType !== 'application/vnd.google-apps.folder') {
        console.warn(
          `Unexpected mime type ${mimeType} for ${item.name}. Skipping.`
        );
        continue;
      }
      if (recursive) {
        console.log('getting files in subfolder', item.name);
        const subfolderFiles = await getFilesInFolder(
          item.id,
          true,
          constructRelativePath(relPath, item.name)
        );
        files.push(...subfolderFiles);
      }
    }
  }
  return files;
}

function constructRelativePath(
  relativeFolderPath: string,
  contentName: string
) {
  return `${relativeFolderPath ? relativeFolderPath + '/' : ''}${contentName}`;
}

async function getMetadataForGoogleDriveId(id: string) {
  const fileDataRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?fields=webContentLink%2CmimeType%2Cname&key=${GOOGLE_API_KEY}`
  );
  const fileMetadata = fileMetadataAPIResponse.parse(await fileDataRes.json());
  return { ...fileMetadata, id };
}

async function storeInDb(file: NewGoogleDriveFile, db: DrizzleDBClient) {
  await db
    .insert(googleDriveFile)
    .values(file)
    .onConflictDoUpdate({
      set: {
        name: file.name,
        downloadUrl: file.downloadUrl,
        mimeType: file.mimeType,
      },
      target: googleDriveFile.id,
    });
}

async function fuzzyMatchSongs(names: string[], db: DrizzleDBClient) {
  // TODO: figure out how to properly create this query with Drizzle (there must be a cleaner way lol)
  const namesSQL = sql.join(
    names.map(n => sql`(${n})`),
    sql.raw(', ')
  );
  const { sql: sqlStr, params } = pgDialect.sqlToQuery(namesSQL);
  const sqlChunks: SQL[] = [
    sql`
  SELECT
  input_string,
  (
    SELECT ${song.name}
    FROM ${song}
    ORDER BY levenshtein(input_string, ${song.name})
    LIMIT 1
  ) AS closest_match
  FROM (VALUES `,
    namesSQL,
    sql`) AS input_strings(input_string);`,
  ];
  const query = sql.fromList(sqlChunks);
  const result = (await db.execute(query)) as {
    input_string: string;
    closest_match: string;
  }[];
  return result.map(r => ({
    inputString: r.input_string,
    closestMatch: r.closest_match,
  }));
}

// export type definition of API
export type SongRouter = typeof googleDriveRouter;
