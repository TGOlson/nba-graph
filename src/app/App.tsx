import React, { Component } from 'react';

import { fetchGraphData, GraphData } from './api';
import { NBAGraph } from './components/NBAGraph';

import "./App.css";
import { createDrawer, loadImageAndCreateTextureInfo } from './program/test';

type AppProps = Record<string, never>; // empty object
type AppState = {
  data: GraphData | null;
};

class App extends Component<AppProps, AppState> {
  testCanvas: React.RefObject<HTMLCanvasElement>;

  constructor(props: AppProps) {
    super(props);

    this.testCanvas = React.createRef();
    this.state = { data: null };
  }

  componentDidMount() {
    fetchGraphData()
      .then(data => this.setState({ data }))
      .catch(err => console.log('Err in app component initial data fetch', err));
  
    const canvas = this.testCanvas.current;
    console.log(canvas?.width, canvas?.height);

    if (!canvas) throw new Error('Unexpected error not able to find test-canvas');
    
    const gl: WebGLRenderingContext | null = canvas.getContext('webgl');

    if (!gl) throw new Error('Unable to create webgl');

    const drawer = createDrawer(gl);

    const chaTextureInfo = loadImageAndCreateTextureInfo(gl, 'http://localhost:3000/assets/img/franchise/CHA.png');
    const chaDrawParams = { 
      x: 100,
      y: 100,
      dx: 0,
      dy: 0,
      textureInfo: chaTextureInfo
    };

    drawer.draw([chaDrawParams]);
    
    setTimeout(() => {
      drawer.draw([chaDrawParams]);
    }, 500);

    // const CHA_URL = 'http://localhost:3000/assets/img/franchise/CHA.png';
    // const CHA_PARAMS = {x: 10, y: 20, offsetX: 0, offsetY: 0};

    // const MIN_URL = 'http://localhost:3000/assets/img/franchise/MIN.png';
    // const MIN_PARAMS = {x: 100, y: 100, offsetX: 0, offsetY: 0};

    // void Promise.all([
    //   loadImage(CHA_URL),
    //   loadImage(MIN_URL)
    // ]).then(([chImage, mnImage]) => drawImages(context, [
    //   {image: chImage, ...CHA_PARAMS},
    //   {image: mnImage, ...MIN_PARAMS}
    // ]));

    // void loadImage(MIN_URL).then(image => drawImage(context, {image, ...MIN_PARAMS}));
  }

  render () {
    const { data } = this.state;

    return (
      <div>
        <h1> Hellooo, World! </h1>
        <canvas width="450" height="299" style={{width: 450, height: 299}} ref={this.testCanvas}></canvas>
        <div className='sprite'></div>
        {data ? <p>Found {data.nodes.length} graph nodes!</p> : <p>Loading...</p>}
        {data ? <NBAGraph data={data}/> : null}
      </div>
    );
  }
}

export default App;
