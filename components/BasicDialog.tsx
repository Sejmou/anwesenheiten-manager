import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { ReactNode } from 'react';

type BasicDialogProps = {
  title: string;
  open: boolean;
  children: ReactNode;
  onClose: () => void;
  closeButtonText?: string;
  onSave?: () => void;
  saveButtonText?: string;
  fullWidth?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  titleHeadingVariant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

const BasicDialog = ({
  title,
  open,
  onSave,
  onClose,
  children,
  saveButtonText,
  closeButtonText,
  fullWidth,
  maxWidth,
  titleHeadingVariant,
}: BasicDialogProps) => {
  return (
    <Dialog
      onClose={onClose}
      open={open}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
    >
      {titleHeadingVariant ? ( // for some reason a variant of undefined also changes the look of the title
        <DialogTitle variant={titleHeadingVariant}>{title}</DialogTitle>
      ) : (
        <DialogTitle>{title}</DialogTitle>
      )}
      <DialogContent>{children}</DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{closeButtonText || 'Schließen'}</Button>
        {onSave && (
          <Button onClick={onSave}>{saveButtonText || 'Speichern'}</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BasicDialog;
