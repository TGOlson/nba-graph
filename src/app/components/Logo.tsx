import React from 'react';

import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';

import HubIcon from '@mui/icons-material/Hub';

type LogoProps = {
  fontSize?: number;
};

const Logo = ({fontSize = 36}: LogoProps) => {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
      <HubIcon color="primary" sx={{fontSize, mb: 0.5}} />
      <Typography level="title-lg" sx={{fontSize}}> NBA Graph</Typography>
    </Box>
  );
};

export default Logo;
