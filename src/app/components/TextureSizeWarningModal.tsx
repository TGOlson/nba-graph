import React from 'react';

import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogContent from '@mui/joy/DialogContent';
import DialogTitle from '@mui/joy/DialogTitle';
import ContactLinks from './ContactLinks';
import { Typography } from '@mui/joy';

type TextureSizeWarningModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const TextureSizeWarningModal = ({open, setOpen}: TextureSizeWarningModalProps) => {
  return (
  <Modal open={open} onClose={() => setOpen(false)}>
    <ModalDialog variant="plain">
      <ModalClose />
      <DialogTitle>Heads up!</DialogTitle>
      <DialogContent>Your system might not support how images are rendered on the graph.</DialogContent>
      <DialogContent>Some images may not display correctly. However, everything else should continue work fine!</DialogContent>
      <DialogContent>
        <Typography level="body-xs">Questions? Get in touch:</Typography>
        <ContactLinks />
      </DialogContent>
    </ModalDialog>
  </Modal>
  );
};

export default TextureSizeWarningModal;
