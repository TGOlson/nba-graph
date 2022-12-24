import React, { Component } from 'react';
import { Franchise, League, Player, PlayerTeam, Season, Team } from '../shared/nba-types';
import "./App.css";
import { DisplayGraph } from './Graph';

async function fetchJSON<T> (url: string): Promise<T> {
  return fetch(url).then(res => res.json() as T);
}

type AppProps = Record<string, never>; // empty object
type AppState = {
  data: null | {
    leagues: League[],
    franchises: Franchise[],
    teams: Team[],
    seasons: Season[],
    players: Player[],
    playerTeams: PlayerTeam[]
  }
};

class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = { data: null };
  }

  componentDidMount() {
    Promise.all([
      fetchJSON<League[]>('/assets/data/leagues.json'), 
      fetchJSON<Franchise[]>('/assets/data/franchises.json'),
      fetchJSON<Team[]>('/assets/data/teams.json'),
      fetchJSON<Season[]>('/assets/data/seasons.json'),
      fetchJSON<Player[]>('/assets/data/players.json'),
      fetchJSON<PlayerTeam[]>('/assets/data/player-teams.json'),
    ])
      .then(([
        leagues,
        franchises,
        teams,
        seasons,
        players,
        playerTeams,
      ]) => {
        this.setState({data: { leagues, franchises, teams, seasons, players, playerTeams }});
      })
      .catch(err => console.log('Err in app component initial data fetch', err));
  }

  render () {
    return (
      <div>
        <h1> Hellooo, World! </h1>
        {this.state.data ? <p>Found {this.state.data.players.length} players!</p> : <p>Loading...</p>}
        <DisplayGraph />
      </div>
    );
  }
}

export default App;
