import React, { Component } from 'react';

import { fetchGraphData, GraphData } from './api';
import { NBAGraph } from './components/NBAGraph';

import "./App.css";
import { combineImages, fetchImage, Sprite } from './util/image';

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

type AppProps = Record<string, never>; // empty object
type AppState = {
  data: GraphData | null;
  sprite: Sprite | null,
};

class App extends Component<AppProps, AppState> {
  testCanvas: React.RefObject<HTMLCanvasElement>;

  constructor(props: AppProps) {
    super(props);

    this.testCanvas = React.createRef();
    this.state = { data: null, sprite: null };
  }

  componentDidMount() {
    void fetchImages()
      .then(async (images) => {
        const sprite = combineImages(images);
        const data = await fetchGraphData();

        this.setState({ data, sprite });
      })
      .catch((err) => { throw err; });
  }

  render () {
    const { data, sprite } = this.state;

    return (
      <div>
        <h1> Hellooo, World! </h1>
        {data ? <p>Found {data.nodes.length} graph nodes!</p> : <p>Loading...</p>}
        {(data && sprite) ? <NBAGraph data={data} sprite={sprite}/> : null}
      </div>
    );
  }
}

export default App;
