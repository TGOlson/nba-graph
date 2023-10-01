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

const ContactLinks = ({showAbout = false}: {showAbout?: boolean}) => (
  <Box display='flex'>
    {showAbout && (
      <React.Fragment>
        <ContactLink href="https://github.com/TGOlson/nba-graph/blob/main/README.md">
          About
        </ContactLink>
        <Divider orientation='vertical' sx={{mt: 0.25, mb: 0.25, mr: 0.75, ml: 0.75}} />
      </React.Fragment>
    )}
    <ContactLink href="https://github.com/TGOlson/nba-graph">
      GitHub
    </ContactLink>
    <Divider orientation='vertical' sx={{mt: 0.25, mb: 0.25, mr: 0.75, ml: 0.75}} />
    <ContactLink href="https://docs.google.com/document/d/1XGBmlh5__Gfm0tUL6QLjE_r43t7PSiBx1sORVxn8Wvk/edit#bookmark=id.jjuudsnpiqaz">
      Contact
    </ContactLink>
  </Box>
);

export default ContactLinks;
