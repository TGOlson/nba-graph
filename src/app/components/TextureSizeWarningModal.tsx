import React from 'react';

import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogContent from '@mui/joy/DialogContent';
import DialogTitle from '@mui/joy/DialogTitle';
import ContactLinks from './ContactLinks';
import { Divider, Typography } from '@mui/joy';

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
      <DialogContent>Your system might not support how images are shown on the graph. Some images may not display correctly.</DialogContent>
      <DialogContent>However, everything else should work as expected. Have fun!</DialogContent>
      <Divider inset='none' />
      <DialogContent sx={{display: 'flex', flexDirection: 'row', gap: 0.75}}>
        <Typography level="body-xs">Questions? Get in touch.</Typography>
        <ContactLinks />
      </DialogContent>
    </ModalDialog>
  </Modal>
  );
};

export default TextureSizeWarningModal;
