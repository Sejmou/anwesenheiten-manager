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
  defaultExpanded?: boolean;
};

export const BasicAccordionItem = ({
  primaryText,
  secondaryText,
  children,
  defaultExpanded,
}: AccordionItemProps) => {
  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{primaryText}</Typography>
        {secondaryText && (
          <Typography
            sx={{ color: 'text.secondary', marginLeft: 'auto', marginRight: 2 }}
          >
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
