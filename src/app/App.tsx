import React, { Component } from 'react';
import { fetchGraphData, GraphData } from './api';

import "./App.css";
import { DisplayGraph } from './components/Graph';


type AppProps = Record<string, never>; // empty object
type AppState = {
  data: GraphData | null;
};

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

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
        {data ? <DisplayGraph data={data}/> : null}
      </div>
    );
  }
}

export default App;
