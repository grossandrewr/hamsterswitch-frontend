import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { ring } from 'ldrs'

ring.register()

const InfoDialog = ({open, onClose, selectedAlbum}) => {
  const albumName = selectedAlbum ? selectedAlbum['name'] : ""
  const artistName = selectedAlbum ? selectedAlbum['artists'][0]['name'] : ""
  const description = selectedAlbum ? selectedAlbum['gptDescription'] : ""

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle id="alert-dialog-title">
        {albumName} - {artistName}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {description ? description : "Loading..."}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  )
}

export default InfoDialog
