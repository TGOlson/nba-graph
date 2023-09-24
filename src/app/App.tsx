import React, { useEffect, useState } from 'react';

import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';
import Typography from '@mui/joy/Typography';

import NBAGraph from './components/NBAGraph';
import { fetchGraphData, GraphData } from './api';
import { combineImages, fetchImage, Sprite } from './util/image';

import "./App.css";
import { logDebug } from './util/logger';
import { notNull } from '../shared/util';

const App = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [sprite, setSprite] = useState<Sprite | null>(null);
  const [graphLoaded, setGraphLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    logDebug('Fetching graph data');
    void fetchGraphData().then((data) => { 
      setData(data);

      const urls = data.nodes.map((node) => node.attributes.image).filter(notNull);
      const uniqueUrls = [...new Set(urls)];
      
      logDebug('Fetching urls', uniqueUrls);
      return Promise.all(uniqueUrls.map(fetchImage));
    }).then((images) => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext;
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  
      logDebug('Max texture size', maxTextureSize);
  
      // Quick google on max texture size support:
      // > 99.9% of devices support 4096x4096
      // ~80% of devices support 8192x8192
      // ~70% of devices support 16384x16384
  
      // (right now our texture is 4k x 11k) ...
      // TODO: maybe just slice into 3 chunks somehow?
      const useSmallTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) < 16000;
  
      const sprite = combineImages(images);
      setSprite(sprite);

      // set an extra timeout to avoid flickering on graph load
      // TODO: might actually work better to load the graph offscreen first 
      setTimeout(() => {
        console.log('Graph loaded');
        setGraphLoaded(true);
      }, 1000);
    }).catch((err) => { throw err; });
  }, []);

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
        display: graphLoaded ? 'none' : 'flex',
        transition: 'visibility 0s, opacity 0.5s linear',
        }}>
          {graphLoaded ? null : (
            <Box sx={{textAlign: 'center', mt: -4}}>
              <Typography sx={{mb: 1}}>NBA Graph</Typography>
              <CircularProgress />
            </Box>
          )}
      </Stack>}
      {data && sprite ? <NBAGraph data={data} sprite={sprite} /> : null}
    </React.Fragment>
  );
};

export default App;
