import { Typography } from '@mui/material';

type Props = {
  attributesAndHeadings: [
    attribute: string | null | undefined,
    heading: string
  ][];
};

const TextAttributeDisplay = ({ attributesAndHeadings }: Props) => {
  const headingsWithContent = attributesAndHeadings.filter(
    ([attribute]) => !!attribute
  );

  return (
    <>
      {headingsWithContent.map(([attribute, heading], i) => (
        <div key={i}>
          <Typography variant="h6">{heading}</Typography>
          <Typography>{attribute}</Typography>
        </div>
      ))}
    </>
  );
};

export default TextAttributeDisplay;
