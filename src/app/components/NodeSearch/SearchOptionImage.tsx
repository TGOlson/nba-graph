import React from 'react';

import Box from '@mui/joy/Box';

import { Option } from "./SearchOption";

type SearchOptionImageProps = {
  option: Option;
};

const SearchOptionImage = ({option}: SearchOptionImageProps) => {
  const {image, crop: {width, height, x, y}} = option.attrs;

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
