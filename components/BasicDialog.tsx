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
  confirmActionButtonText?: string;
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
  confirmActionButtonText,
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
        {confirmActionButtonText && (
          <Button onClick={onSave}>{confirmActionButtonText}</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BasicDialog;
