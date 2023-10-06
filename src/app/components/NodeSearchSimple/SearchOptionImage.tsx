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
  borderColor: string;
};

const SearchOptionImage = (props: SearchOptionImageProps) => {
  if (props.type === 'placeholder') return <Skeleton variant="circular" animation={false} width={44} height={44} />;

  const {crop, image, borderColor} = props;
  const {width, height, x, y} = crop;

  return (
    <Box sx={{
      border: `3px solid ${borderColor}`,
      width: '44px',
      height: '44px',
      borderRadius: '50%',
    }}>

    <Box 
      style={{
        transform: `scale(${38 / width})`,
        transformOrigin: 'left top',
        borderRadius: '50%',
        width: `${width}px`,
        height: `${height}px`,
        background: `url(${image}) ${-1 * x}px ${-1 * y}px`,
      }}
      />
     </Box>
  );
};

export default SearchOptionImage;
