import { z } from 'zod';
import { publicProcedure, createTRPCRouter, protectedProcedure } from '../trpc';

const getGoogleAPIKey = () => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('No Google API key found');
  }
  console.log('GOOGLE_API_KEY', process.env.GOOGLE_API_KEY);
  return process.env.GOOGLE_API_KEY;
};

const GOOGLE_API_KEY = getGoogleAPIKey();
const googleDriveFolderId = '1-6hG9wl-E7ymovC6uub9roJgGyVz1tOM'; // public folder for choir-related files

const sourceDataInput = z.object({
  downloadLink: z.string().url(),
  mimeType: z.string(),
});

export const googleDriveRouter = createTRPCRouter({
  syncFiles: protectedProcedure.mutation(async ({ ctx }) => {
    const folderFilesApiRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q="${googleDriveFolderId}"+in+parents&key=${GOOGLE_API_KEY}` // try fetching data about Google Drive folder
    );
    const response = await folderFilesApiRes.json();
    console.log(response.files);
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
        const { downloadLink, mimeType } = await getDownloadLink(id);
        const returnVal = {
          id,
          downloadLink,
          mimeType,
          name,
        };
        console.log(returnVal);
        return returnVal;
      })
    );

    return [];
  }),
});

async function getDownloadLink(id: string) {
  const fileDataRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?fields=webContentLink%2CmimeType&key=${GOOGLE_API_KEY}`
  );
  const fileDataJson = await fileDataRes.json();
  const fileSrcData = sourceDataInput.parse({
    downloadLink: fileDataJson.webContentLink,
    mimeType: fileDataJson.mimeType,
  });
  console.log(fileSrcData);
  return fileSrcData;
}

// export type definition of API
export type SongRouter = typeof googleDriveRouter;
