import path from 'path';

const p = (x: string): string => path.resolve(__dirname, x)

export const DATA_PATH = p('../data');
export const SEASON_PATH = p('../data/seasons.json');
export const LEAGUE_PATH = p('../data/leagues.json');
export const FRANCHISE_PATH = p('../data/franchises.json');
export const TEAM_PATH = p('../data/teams.json');
export const PLAYER_PATH = p('../data/players.json');
export const PLAYER_TEAM_PATH = p('../data/player-teams.json');
