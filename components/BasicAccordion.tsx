import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ReactNode } from 'react';

type AccordionProps = {
  children: ReactNode;
};

type AccordionItemProps = {
  primaryText: string;
  secondaryText?: string;
  children: ReactNode;
};

export const BasicAccordionItem = ({
  primaryText,
  secondaryText,
  children,
}: AccordionItemProps) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ width: '33%', flexShrink: 0 }}>
          {primaryText}
        </Typography>
        {secondaryText && (
          <Typography sx={{ color: 'text.secondary' }}>
            {secondaryText}
          </Typography>
        )}
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

const BasicAccordion = ({ children }: AccordionProps) => {
  return <div>{children}</div>;
};

export default BasicAccordion;
