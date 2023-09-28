import React, { useEffect, useState } from 'react';

import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';
import Typography from '@mui/joy/Typography';

import map from 'ramda/src/map';
import uniqBy from 'ramda/src/uniqBy';

import NBAGraph from './components/NBAGraph';
import { fetchGraphData, GraphData } from './api';
import { fetchImage } from './api';
import { logDebug } from './util/logger';

import "./App.css";
import { Sprite } from './util/types';

const App = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [sprites, setSprites] = useState<Sprite[] | null>(null);
  const [graphLoaded, setGraphLoaded] = useState<boolean>(false);
  
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
        // display: graphLoaded ? 'none' : 'flex',
        visibility: graphLoaded ? 'hidden' : 'flex',
        transition: 'visibility 0.5s, opacity 0.5s ease-in',
        }}>
          {graphLoaded ? null : (
            <Box sx={{textAlign: 'center', mt: -4}}>
              <Typography sx={{mb: 1}}>NBA Graph</Typography>
              <CircularProgress />
            </Box>
          )}
      </Stack>}
      {data && sprites ? <NBAGraph data={data} sprites={sprites} /> : null}
    </React.Fragment>
  );
};

export default App;
