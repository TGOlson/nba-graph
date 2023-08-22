import React from 'react';

import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';

const Header = () => {

  const sx = {
    top: 0,
    p: 1,
    pl: 2,
    pr: 2,
    position: 'absolute', 
    // width: '100vw', 
    zIndex: 1000,
  };

  return (
    <Box sx={sx}>
      <Typography level="title-lg" variant='outlined' sx={{backgroundColor: 'rgba(255, 255, 255, 0.8)'}}>NBA Graph</Typography>
    </Box>
  );
};

export default Header;
