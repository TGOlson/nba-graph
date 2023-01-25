import React, { Component } from 'react';

import { fetchGraphData, GraphData } from './api';
import { NBAGraph } from './components/NBAGraph';

import "./App.css";
import { Coordinates } from 'sigma/types';

const fetchImage = (url: string): Promise<{url: string, img: HTMLImageElement}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({url, img});
    };

    img.src = url;

    // TODO: error handler
  });
}

const fetchSprites = (): Promise<{[key: string]: HTMLImageElement}> => {
  return Promise.all([
    fetchImage('/assets/sprites/team.png'),
    fetchImage('/assets/sprites/team_muted.png'),
    fetchImage('/assets/sprites/franchise.png'),
    fetchImage('/assets/sprites/franchise_muted.png'),
  ]).then(res => {
    return res.reduce((acc, val) => ({...acc, [val.url]: val.img}), {});
  });
};

const combineSprites = (sprites: {[key: string]: HTMLImageElement}): {offsets: {[key: string]: Coordinates}, img: ImageData} => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', {willReadFrequently: true}) as CanvasRenderingContext2D;

  const images = Object.values(sprites);

  const width = Math.max(...images.map(x => x.width));
  const height = images.reduce((acc, x) => acc + x.height, 0);
  canvas.width = width;
  canvas.height = height;

  let yOffset = 0;

  const offsets: {[key: string]: Coordinates} = {};

  for (const url in sprites) {
    const img = sprites[url];
    if (!img) throw new Error(`Missing sprite image for url: ${url}`);

    ctx.drawImage(img, 0, yOffset);
    offsets[url] = {x: 0, y: yOffset};

    yOffset += img.height;
  }

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);

  return {offsets, img};
};

type AppProps = Record<string, never>; // empty object
type AppState = {
  data: GraphData | null;
  sprite: {offsets: {[key: string]: Coordinates}, img: ImageData} | null,
};

class App extends Component<AppProps, AppState> {
  testCanvas: React.RefObject<HTMLCanvasElement>;

  constructor(props: AppProps) {
    super(props);

    this.testCanvas = React.createRef();
    this.state = { data: null, sprite: null };
  }

  componentDidMount() {
    void fetchSprites()
      .then(sprites => {
        const sprite = combineSprites(sprites);

        return fetchGraphData()
          .then(data => this.setState({ data, sprite }))
          .catch(err => console.log('Err in app component initial data fetch', err));
      });
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
