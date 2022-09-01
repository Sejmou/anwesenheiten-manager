import { Box, Button, List, ListItem } from '@mui/material';
import { DropzoneRootProps, useDropzone } from 'react-dropzone';

type Props = {
  text: string;
  dragText?: string;
  fileTypesAndExtensions?: {
    [mimeType: string]: string[];
  };
} & DropzoneRootProps;
const CustomDropzone = ({ text, dragText, fileTypesAndExtensions }: Props) => {
  const onDrop = (acceptedFiles: File[]) => {
    console.log(acceptedFiles);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: fileTypesAndExtensions,
    useFsAccessApi: false, // needed to make it work on Ubuntu: https://github.com/react-dropzone/react-dropzone/issues/1223
    onDrop,
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
      <input {...getInputProps({ className: 'dropzone' })} />
      <Button>{isDragActive ? dragText ?? text : text}</Button>
    </Box>
  );
};
export default CustomDropzone;
