import { Franchise, League, Player, PlayerTeam, Season, Team } from '../shared/nba-types';

export type NBAData = {
  leagues: League[];
  franchises: Franchise[];
  teams: Team[];
  seasons: Season[];
  players: Player[];
  playerTeams: PlayerTeam[];
};

async function fetchJSON<T> (url: string): Promise<T> {
  return fetch(url).then(res => res.json() as T);
}

export async function fetchNBAData(): Promise<NBAData> {
  return Promise.all([
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
      return { leagues, franchises, teams, seasons, players, playerTeams };
    });
}
