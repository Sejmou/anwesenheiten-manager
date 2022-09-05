import { Box, Stack, Typography } from '@mui/material';
import { DropzoneRootProps, useDropzone } from 'react-dropzone';

type Props = {
  text: string;
  dragText?: string;
  note?: string;
  fileTypesAndExtensions?: {
    [mimeType: string]: string[];
  };
  onFilesAdded: (files: File[]) => void;
} & DropzoneRootProps;
const CustomDropzone = ({
  text,
  dragText,
  note,
  fileTypesAndExtensions,
  onFilesAdded,
}: Props) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: fileTypesAndExtensions,
    useFsAccessApi: false, // needed to make it work on Ubuntu: https://github.com/react-dropzone/react-dropzone/issues/1223
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) onFilesAdded(acceptedFiles);
    },
  });

  return (
    <Box
      sx={{
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        py: 8,
        px: 2,
        border: '2px dashed',
        borderColor: 'primary.main',
      }}
      {...getRootProps()}
      className="container"
    >
      <Stack spacing={1}>
        <input
          style={{ display: 'none' }}
          {...getInputProps({ className: 'dropzone' })}
        />
        <Typography color="primary" textTransform="uppercase">
          {isDragActive ? dragText ?? text : text}
        </Typography>
        <Typography>{note}</Typography>
      </Stack>
    </Box>
  );
};
export default CustomDropzone;
