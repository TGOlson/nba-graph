import React, { Component } from 'react';
// import "./App.css";

class App extends Component {
  componentDidMount() {
    fetch('/assets/data/leagues.json')
      .then(res => res.json())
      .then(x => console.log('bang', x))
      .catch(err => console.log('Err', err));
  }

  render () {
    return (
      <div>
        <h1> Hellooo, World! </h1>
      </div>
    );
  }
}

export default App;
