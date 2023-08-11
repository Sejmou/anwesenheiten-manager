import { publicFolderId } from 'utils/google-drive';
import { create } from 'zustand';

type LinkCreatorStore = {
  songsFolderId: string | null;
  setSongsFolderId: (id: string) => void;
};

export const useLinkCreatorStore = create<LinkCreatorStore>(set => ({
  songsFolderId: publicFolderId,
  setSongsFolderId: id => set({ songsFolderId: id }),
}));
