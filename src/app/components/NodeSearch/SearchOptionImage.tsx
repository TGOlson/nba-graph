import React from 'react';

import Box from '@mui/joy/Box';

import { Option } from "./SearchOption";

type SearchOptionImageProps = {
  option: Option;
};

const SearchOptionImage = ({option}: SearchOptionImageProps) => {
  // TODO: initial load seems slow, maybe add placeholder image?

  return (
    <Box sx={{
      p: 0,
      m: 0,
      transform: `scale(${40 / option.attrs.crop.width})`,
      transformOrigin: 'left top',
      borderRadius: '50%',
      width: `${option.attrs.crop.width}px`,
      height: `${option.attrs.crop.height}px`,
      background: `url(${option.attrs.image}) ${getPosition(option.attrs.crop)}`,
    }}/>
  );
};

const getPosition = ({x, y}: {x: number, y: number}): string => `${-1 * x}px ${-1 * y}px`;

export default SearchOptionImage;
