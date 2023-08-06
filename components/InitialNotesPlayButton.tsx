import { useEffect, useState } from 'react';
import type { SongFileLink } from 'drizzle/models';
import { PlayArrow as Play, Stop, MusicNote } from '@mui/icons-material';
import { Button, SxProps } from '@mui/material';

type NotesPlayButtonProps = {
  link: SongFileLink;
  sx?: SxProps;
};

const InitialNotesPlayButton = ({ link, sx }: NotesPlayButtonProps) => {
  const [playing, setPlaying] = useState(false);
  const [audio] = useState<HTMLAudioElement>(
    (typeof Audio !== 'undefined'
      ? new Audio(link.url)
      : undefined) as HTMLAudioElement
  );

  useEffect(() => {
    // Clean up function to stop and release the audio when the component unmounts
    return () => {
      audio.pause();
      audio.src = ''; // Clear the audio source to release resources
    };
  }, [audio]);

  const handlePlayPause = async () => {
    if (audio.paused) {
      await audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handlePlayPause}
      startIcon={!playing ? <Play /> : <Stop />}
      sx={sx}
    >
      Töne
    </Button>
  );
};

export default InitialNotesPlayButton;
