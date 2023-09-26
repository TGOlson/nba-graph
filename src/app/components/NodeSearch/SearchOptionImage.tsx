import React from 'react';

import Box from '@mui/joy/Box';
import Skeleton from '@mui/joy/Skeleton';

import { NodeAttributes } from '../../../shared/types';

type SearchOptionImageProps = {
  type: 'placeholder'
} | {
  type?: 'image',
  image: NodeAttributes['image'];
  crop: NodeAttributes['crop'];
};

const SearchOptionImage = (props: SearchOptionImageProps) => {
  if (props.type === 'placeholder') return <Skeleton variant="circular" animation={false} width={40} height={40} />;

  const {crop, image} = props;
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
