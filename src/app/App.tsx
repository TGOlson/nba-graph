import React, { useEffect, useState } from 'react';

import { fetchGraphData, GraphData } from './api';
import { combineImages, fetchImage, Sprite } from './util/image';
import { EmptyObject } from '../shared/types';

import "./App.css";

import Stack from '@mui/joy/Stack';

import NBAGraph from './components/NBAGraph';
import ControlPanel from './components/ControlPanel';
import { useSigma } from '@react-sigma/core';

const fetchImages = (): Promise<HTMLImageElement[]> => {
  return Promise.all([
    fetchImage('/assets/sprites/franchise_muted.png'),
    fetchImage('/assets/sprites/franchise.png'),
    fetchImage('/assets/sprites/team.png'),
    fetchImage('/assets/sprites/team_muted.png'),
    fetchImage('/assets/sprites/player.png'),
    fetchImage('/assets/sprites/player_muted.png'),
  ]);
};

const App = () => {
  const [data, setData] = useState<GraphData | null>(null);
  const [sprite, setSprite] = useState<Sprite | null>(null);
  
  useEffect(() => {
    void Promise.all([fetchImages(), fetchGraphData(),]).then(([images, data]) => {
      const sprite = combineImages(images);
      
      setData(data);
      setSprite(sprite);
    }).catch((err) => { throw err; });
  }, []);
  
  const graphLoaded = data && sprite;

  return (
    <Stack style={{height: '100vh'}}>
      {graphLoaded ? <NBAGraph data={data} sprite={sprite}/> : <p>Loading...</p>}
    </Stack>
  );
};

export default App;
