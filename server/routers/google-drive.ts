import { z } from 'zod';
import { publicProcedure, createTRPCRouter, protectedProcedure } from '../trpc';
import { googleDriveFile } from 'drizzle/schema';
import { publicFolderId } from 'utils/google-drive';

const getGoogleAPIKey = () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('No Google API key found');
  }
  return process.env.GOOGLE_API_KEY;
};

const GOOGLE_API_KEY = getGoogleAPIKey();

const sourceDataInput = z.object({
  downloadUrl: z.string().url(),
  mimeType: z.string(),
});

export const googleDriveRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    const files = await ctx.db.query.googleDriveFile.findMany({
      orderBy: f => f.name,
      with: {
        songFileLink: true,
      },
    });
    return files;
  }),
  sync: protectedProcedure.mutation(async ({ ctx }) => {
    const folderFilesApiRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q="${publicFolderId}"+in+parents&key=${GOOGLE_API_KEY}` // try fetching data about Google Drive folder
    );
    const response = await folderFilesApiRes.json();
    const files = (response.files as { name: string; id: string }[]).map(f => ({
      name: f.name,
      id: f.id,
    }));
    if (files.length === 0) {
      throw new Error('No files found');
    }
    const filesWithDownloadLinks = await Promise.all(
      files.map(async file => {
        const { id, name } = file;
        const { downloadUrl, mimeType } = await getDownloadMetadata(id);
        const returnVal = {
          id,
          downloadUrl,
          mimeType,
          name,
          lastSyncAt: new Date(),
        };
        return returnVal;
      })
    );

    // couldn't figure out how to do upsert many, so I am doing it one by one
    const updates = filesWithDownloadLinks.map(async file => {
      await ctx.db
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
    });
    await Promise.all(updates);

    return;
  }),
});

async function getDownloadMetadata(id: string) {
  const fileDataRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?fields=webContentLink%2CmimeType&key=${GOOGLE_API_KEY}`
  );
  const fileDataJson = await fileDataRes.json();
  const fileSrcData = sourceDataInput.parse({
    downloadUrl: fileDataJson.webContentLink,
    mimeType: fileDataJson.mimeType,
  });
  return fileSrcData;
}

// export type definition of API
export type SongRouter = typeof googleDriveRouter;
