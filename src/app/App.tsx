import React, { Component } from 'react';
// import "./App.css";

class App extends Component {
  componentDidMount() {
    fetch('/data/leagues.json')
      .then(res => console.log('Res', res))
      .catch(err => console.log('Err', err))
  }

  render () {
    return (
      <div>
        <h1> Hello, World! </h1>
      </div>
    );
  }
}

export default App;
