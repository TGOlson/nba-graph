import React from 'react';
import { useCamera } from '@react-sigma/core';

import Card from '@mui/joy/Card';
import IconButton from '@mui/joy/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AdjustIcon from '@mui/icons-material/Adjust';

const ZoomControl = () => {
  const { zoomIn, zoomOut, reset } = useCamera({ duration: 200, factor: 1.5 });

  return (
    <Card variant='outlined' sx={{
      bottom: 0,
      right: 0,
      m: 1,
      position: 'absolute', 
      boxShadow: 'none',
      gap: 0,
      padding: 0,
      "--Card-radius": "6px",
    }}>
      <IconButton onClick={() => zoomIn()} size='sm'>
        <AddIcon />
      </IconButton>
      <IconButton onClick={() => zoomOut()} size='sm'>
        <RemoveIcon />
      </IconButton>
      <IconButton onClick={() => reset()} size='sm'>
        <AdjustIcon />
      </IconButton>
    </Card>
  );
};

export default ZoomControl;
