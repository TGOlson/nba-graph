import { readFile } from 'fs/promises';
import { Franchise, League, Player, PlayerTeam, Season, Team } from '../../shared/nba-types';

import { FRANCHISE_PATH, LEAGUE_PATH, PLAYER_PATH, PLAYER_TEAM_PATH, SEASON_PATH, TEAM_PATH } from './path';

function reader<T> (path: string): () => Promise<T> {
  return () => readFile(path, 'utf8').then((x: string) => {
    return JSON.parse(x) as T;
  });
}

export const readSeasons = reader<Season[]>(SEASON_PATH);
export const readLeagues = reader<League[]>(LEAGUE_PATH);
export const readFranchises = reader<Franchise[]>(FRANCHISE_PATH);
export const readTeams = reader<Team[]>(TEAM_PATH);
export const readPlayers = reader<Player[]>(PLAYER_PATH);
export const readPlayerTeams = reader<PlayerTeam[]>(PLAYER_TEAM_PATH);
