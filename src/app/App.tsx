import React, { Component } from 'react';

import { fetchGraphData, GraphData } from './api';
import { NBAGraph } from './components/NBAGraph';
import { combineImages, fetchImage, Sprite } from './util/image';
import { EmptyObject } from '../shared/types';

import "./App.css";

import Stack from '@mui/joy/Stack';
import { ControlPanel } from './components/ControlPanel';

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

type AppProps = EmptyObject;
type AppState = {
  data: GraphData | null;
  sprite: Sprite | null,
};

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = { data: null, sprite: null };
  }

  componentDidMount() {
    void Promise.all([
      fetchImages(),
      fetchGraphData(),
    ]).then(([images, data]) => {
      const sprite = combineImages(images);

      this.setState({ data, sprite });
    }).catch((err) => { throw err; });
  }

  render () {
    const { data, sprite } = this.state;

    const graphLoaded = data && sprite;
    
    return (
      <Stack style={{height: '100vh'}}>
        <ControlPanel searchableNodes={graphLoaded ? data.nodes : []}/>
        {graphLoaded ? <NBAGraph data={data} sprite={sprite}/> : <p>Loading...</p>}
      </Stack>
    );
  }
}

export default App;
