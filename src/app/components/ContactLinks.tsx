import React from 'react';

import Box from '@mui/joy/Box';
import Link from '@mui/joy/Link';
import Divider from '@mui/joy/Divider';

const ContactLink = ({href, children}: {href: string, children: string}) => {
  return (
    <Link 
      href={href}
      level="body-xs" 
      target="_blank"
      rel="noreferrer"
      >
      {children}
    </Link>
  );
};

const ContactLinks = () => (
  <Box display='flex'>
    <ContactLink href="https://github.com/TGOlson/nba-graph">
      GitHub
    </ContactLink>
    <Divider orientation='vertical' sx={{mt: 0.25, mb: 0.25, mr: 0.75, ml: 0.75}} />
    <ContactLink href="https://twitter.com/TyGuyO">
      @tyguyo
    </ContactLink>
  </Box>
);

export default ContactLinks;
