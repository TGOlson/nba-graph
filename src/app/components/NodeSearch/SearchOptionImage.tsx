import React from 'react';

import Box from '@mui/joy/Box';

import { NodeAttributes } from '../../../shared/types';

type SearchOptionImageProps = {
  image: NodeAttributes['image'];
  crop: NodeAttributes['crop'];
};

const SearchOptionImage = ({image, crop}: SearchOptionImageProps) => {
  const {width, height, x, y} = crop;

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
