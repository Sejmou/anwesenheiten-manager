import { api } from 'utils/api';
import { FolderToSongMapping, useLinkCreatorStore } from '../../store';

type MappingWithSong = FolderToSongMapping & {
  songId: string;
};

function isMappingWithSong(
  mapping: FolderToSongMapping
): mapping is MappingWithSong {
  return (mapping as MappingWithSong).songId !== undefined;
}

const LinkFilesStep = () => {
  const songs = api.song.getAll.useQuery();
  const mappings =
    useLinkCreatorStore(state => state.mappings)?.filter(isMappingWithSong) ??
    [];
  const fileFolders =
    api.googleDrive.getSongFolderFileMappings.useQuery(mappings);

  console.log(fileFolders.data);

  return (
    <div>
      Hier kann man bald die verlinkten Dateien für jeden Song ansehen und
      bearbeiten.
    </div>
  );
};

export default LinkFilesStep;
