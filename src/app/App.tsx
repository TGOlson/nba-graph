import React, { Component } from 'react';

import { fetchGraphData, GraphData } from './api';
import { NBAGraph } from './components/NBAGraph';

import "./App.css";
// import { createDrawer, DEFAULT_DRAW_SPEC, loadImageAndCreateTextureInfo } from './program/test';

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
  
    // const canvas = this.testCanvas.current;
    // console.log(canvas?.width, canvas?.height);

    // if (!canvas) throw new Error('Unexpected error not able to find test-canvas');
    
    // const gl: WebGLRenderingContext | null = canvas.getContext('webgl');

    // if (!gl) throw new Error('Unable to create webgl');

    // const drawer = createDrawer(gl);

    // const chaTextureInfo = loadImageAndCreateTextureInfo(gl, 'http://localhost:3000/assets/img/franchise/CHA.png');
    // const chaDrawParams = { 
    //   src: {x: 50, y: 50, width: 50, height: 50},
    //   dest: DEFAULT_DRAW_SPEC,
    //   textureInfo: chaTextureInfo
    // };

    // const minTextureInfo = loadImageAndCreateTextureInfo(gl, 'http://localhost:3000/assets/img/franchise/MIN.png');
    // const minDrawParams = { 
    //   src: DEFAULT_DRAW_SPEC,
    //   dest: {x: 200, y: 200, width: 50, height: 50},
    //   textureInfo: minTextureInfo
    // };

    // drawer.draw([chaDrawParams, minDrawParams]);
    
    // setTimeout(() => {
    //   drawer.draw([chaDrawParams, minDrawParams]);
    // }, 500);
  }

  render () {
    const { data } = this.state;

    return (
      <div>
        <h1> Hellooo, World! </h1>
        {data ? <p>Found {data.nodes.length} graph nodes!</p> : <p>Loading...</p>}
        {data ? <NBAGraph data={data}/> : null}
      </div>
    );
  }
}

export default App;
