import React, { Component } from 'react';

import { fetchGraphData, GraphData } from './api';
import { NBAGraph } from './components/NBAGraph';

import "./App.css";

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
