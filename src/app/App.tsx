import React, { useEffect, useState } from 'react';

import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';
import Typography from '@mui/joy/Typography';

import NBAGraph from './components/NBAGraph';
import { fetchGraphData, GraphData } from './api';
import { combineImages, fetchImage, Sprite } from './util/image';

import "./App.css";
import { notNull } from '../shared/util';

const loading = (
  <Box sx={{textAlign: 'center', mt: -4}}>
    <Typography sx={{mb: 1}}>Loading graph...</Typography>
    <CircularProgress />
  </Box>
);

const App = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [sprite, setSprite] = useState<Sprite | null>(null);
  const [graphLoaded, setGraphLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    console.log('fetching graph data...');
    void fetchGraphData().then((data) => { 
      setData(data);

      const urls = data.nodes.map((node) => node.attributes.image).filter(notNull);
      const uniqueUrls = [...new Set(urls)];
      
      console.log('fetching images...', uniqueUrls);
      return Promise.all(uniqueUrls.map(fetchImage));
    }).then((images) => {
      const sprite = combineImages(images);
      setSprite(sprite);

      // set an extra timeout to avoid flickering on graph load
      // TODO: might actually work better to load the graph offscreen first 
      setTimeout(() => setGraphLoaded(true), 500);
    }).catch((err) => { throw err; });
  }, []);

  return (
    <Stack sx={{height: '100vh', alignItems: 'center', justifyContent: 'center'}}>
      {graphLoaded && data && sprite ? <NBAGraph data={data} sprite={sprite}/> : loading}
    </Stack>
  );
};

export default App;
