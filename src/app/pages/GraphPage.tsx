import React, { useEffect, useMemo, useState } from 'react';

import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';
import Typography from '@mui/joy/Typography';

import map from 'ramda/src/map';
import uniqBy from 'ramda/src/uniqBy';

import NBAGraph from '../components/NBAGraph';
import Logo from '../components/Logo';
import TextureSizeWarningModal from '../components/TextureSizeWarningModal';

import { fetchGraphData, GraphData } from '../api';
import { fetchImage } from '../api';
import { logDebug } from '../util/logger';
import { Sprite } from '../util/types';

const GraphPage = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [sprites, setSprites] = useState<Sprite[] | null>(null);
  const [graphLoaded, setGraphLoaded] = useState<boolean>(false);
  const [showTextureWarningModal, setShowTextureWarningModal] = useState<boolean>(false);
  
  useEffect(() => {
    logDebug('Fetching graph data');
    void fetchGraphData().then((data) => { 
      setData(data);

      const spriteUrlsAll = data.nodes.map(({attributes: {type, image}}) => ({key: type, url: image}));
      const spriteUrls = uniqBy(({key, url}) => `${key}-${url}`, spriteUrlsAll);

      logDebug(`Fetching sprites`, spriteUrls);
      const spritePromises = map(({key, url}) => fetchImage(url).then((image) => ({key, image})), spriteUrls);

      return Promise.all(spritePromises);
    }).then((sprites) => {
      setSprites(sprites);

      const maxSpriteSize = sprites.reduce((max, {image}) => Math.max(max, image.width, image.height), 0);

      const gl = document.createElement('canvas').getContext('webgl') as WebGLRenderingContext;
      const maxTextureSizeSupported = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
        
      if (maxSpriteSize > maxTextureSizeSupported) {
        setShowTextureWarningModal(true);
        logDebug(`[warning] Max sprite size (${maxSpriteSize}) is larger than max supported texture size (${maxTextureSizeSupported})`);
      }

      // Use timeout to prevent weird flickering of loading screen
      setTimeout(() => setGraphLoaded(true), 0);
    }).catch((err) => { throw err; });
  }, []);

  // Memoize the graph component so that it doesn't re-render during the additional load delay
  const graphComponent = useMemo(() => {
    if (!data || !sprites) return null;
    return <NBAGraph data={data} sprites={sprites} />;
  }, [data, sprites]);

  return (
    <React.Fragment>
      {<Stack sx={{
        height: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        opacity: graphLoaded ? 0 : 1,
        backgroundColor: '#fcfcfc',
        zIndex: 1000,
        visibility: graphLoaded ? 'hidden' : 'flex',
        transition: 'visibility 0.5s, opacity 0.5s ease-in',
        }}>
          {graphLoaded ? null : (
            <Box sx={{textAlign: 'center', mt: -14}}>
              <Logo />
              <Typography level="body-sm" sx={{mb: 4}}>Visualizing basketball history</Typography>
              <CircularProgress />
            </Box>
          )}
      </Stack>}
      {graphComponent}
      <TextureSizeWarningModal open={showTextureWarningModal} setOpen={setShowTextureWarningModal} />
    </React.Fragment>
  );
};

export default GraphPage;
