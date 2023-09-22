import React, { useEffect, useState } from 'react';

import Skeleton from '@mui/joy/Skeleton';
import Box from '@mui/joy/Box';

import { Option } from "./SearchOption";
import { fetchImage } from '../../util/image';

type SearchOptionImageProps = {
  option: Option;
};

const SearchOptionImage = ({option}: SearchOptionImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const isPlayer = option.attrs.nbaType === 'player';
  const hasImage = !option.attrs.image.includes('default');

  // small optimization, force loading the image into memory before trying to render the image
  // this avoids a little bit of lag when the results are first rendered in the search bar
  // note: only do this for player images since it's such a large sprite, all other images are fine
  useEffect(() => {
    if (isPlayer && hasImage) void fetchImage(option.attrs.image).then(() => setLoaded(true));
  }, []);

  const {image, crop: {width, height, x, y}} = option.attrs;

  if (isPlayer && hasImage && !loaded) return <Skeleton variant="circular" width={40} height={40} />;

  return (
    <Box 
      style={{
        transform: `scale(${40 / width})`,
        transformOrigin: 'left top',
        borderRadius: '50%',
        width: `${width}px`,
        height: `${height}px`,
        background: `url(${image}) ${-1 * x}px ${-1 * y}px`,
      }}
    />
  );
};

export default SearchOptionImage;
