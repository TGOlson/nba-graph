import React from 'react';

import { Option } from "./SearchOption";

type SearchOptionImageProps = {
  option: Option;
};

const SearchOptionImage = ({option}: SearchOptionImageProps) => {
  // TODO: initial load seems slow, maybe add placeholder image?

  const {image, crop: {width, height, x, y}} = option.attrs;

  return (
    <img 
      src={image}
      style={{
        transform: `scale(${40 / width})`,
        transformOrigin: 'left top',
        borderRadius: '50%',
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'none',
        objectPosition: `${-1 * x}px ${-1 * y}px`,
      }}
    />
  );
};

export default SearchOptionImage;
