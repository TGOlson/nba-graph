import React, { Component } from 'react';

import { fetchGraphData, GraphData } from './api';
import { NBAGraph } from './components/NBAGraph';

import "./App.css";

const fetchImageData = (url: string): Promise<{url: string, img: ImageData}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', {willReadFrequently: true}) as CanvasRenderingContext2D;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);

      resolve({url, img: image});
    }

    img.src = url;

    // TODO: error handler
  });
}

const fetchSprites = (): Promise<{url: string, img: ImageData}[]> => {
  return Promise.all([
    fetchImageData('/assets/sprites/team.png'),
    fetchImageData('/assets/sprites/team_muted.png'),
  ]);
};

type AppProps = Record<string, never>; // empty object
type AppState = {
  data: GraphData | null;
  image: ImageData,
};

class App extends Component<AppProps, AppState> {
  testCanvas: React.RefObject<HTMLCanvasElement>;

  constructor(props: AppProps) {
    super(props);

    this.testCanvas = React.createRef();
    this.state = { data: null, image: new ImageData(1, 1) };
  }

  componentDidMount() {
    void fetchSprites()
      .then(res => {
        // TODO: need to combine sprites here and provide a mapping to the image program to know how to translate offsets
        const first = res[0];
        if (!first) throw new Error('Unexpected no sprite found');

        const image = first.img;

        return fetchGraphData()
          .then(data => this.setState({ data, image }))
          .catch(err => console.log('Err in app component initial data fetch', err));
      });
  }

  render () {
    const { data, image } = this.state;

    return (
      <div>
        <h1> Hellooo, World! </h1>
        {data ? <p>Found {data.nodes.length} graph nodes!</p> : <p>Loading...</p>}
        {data ? <NBAGraph data={data} image={image}/> : null}
      </div>
    );
  }
}

export default App;
