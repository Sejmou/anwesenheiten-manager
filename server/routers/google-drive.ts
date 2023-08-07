import { ZodError, z } from 'zod';
import { publicProcedure, createTRPCRouter, protectedProcedure } from '../trpc';
import { googleDriveFile } from 'drizzle/schema';
import { createInsertSchema } from 'drizzle-zod';
import { NewGoogleDriveFile } from 'drizzle/models';
import type { DrizzleDBClient } from 'server/db';
import { inArray, notInArray } from 'drizzle-orm';

const getGoogleAPIKey = () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('No Google API key found');
  }
  return process.env.GOOGLE_API_KEY;
};

const GOOGLE_API_KEY = getGoogleAPIKey();

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
  // new in this context means that the file is not yet stored in the GoogleDriveFile table
  getNewFilesForFolderId: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      console.log('getting new files for folder id', input);
      const files = await getFilesInFolderRecursively(input);
      const existingFileIDs = await ctx.db
        .select({ id: googleDriveFile.id })
        .from(googleDriveFile)
        .where(
          inArray(
            googleDriveFile.id,
            files.map(f => f.id)
          )
        );
      // convert array of existing file IDs to a set
      const existingFileIds = new Set(existingFileIDs.map(f => f.id));
      const newFiles = files.filter(f => !existingFileIds.has(f.id));
      console.log('new files', newFiles);
      return newFiles;
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

async function getFilesInFolderRecursively(folderId: string, relPath = '') {
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
      console.log('getting files in subfolder', item.name);
      const subfolderFiles = await getFilesInFolderRecursively(
        item.id,
        constructRelativePath(relPath, item.name)
      );
      files.push(...subfolderFiles);
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

// export type definition of API
export type SongRouter = typeof googleDriveRouter;
