import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Franchise, League, Player, PlayerSeason, Season, Team } from "../shared/nba-types";

const DIR_PATH = path.resolve(__dirname, '../data/parsed');
const LEAGUE_FILENAME = 'leagues.json';
const FRANCHISE_FILENAME = 'franchises.json';
const TEAM_FILENAME = 'teams.json';
const SEASON_FILENAME = 'seasons.json';
const PLAYER_FILENAME = 'players.json';
const PLAYER_SEASON_FILENAME = 'player-seasons.json';

async function persist<T>(dir: string, fileName: string, res: T): Promise<void> {
  const filePath = path.resolve(dir, fileName);
  console.log('Saving output to:', filePath);

  await mkdir(dir, { recursive: true });

  return await writeFile(filePath, JSON.stringify(res));
}

export async function persistLeagues(res: League[]): Promise<void> {
  return persist(DIR_PATH, LEAGUE_FILENAME, res);
}

export async function persistFranchises(res: Franchise[]): Promise<void> {
  return persist(DIR_PATH, FRANCHISE_FILENAME, res);
}

export async function persistTeams(res: Team[]): Promise<void> {
  return persist(DIR_PATH, TEAM_FILENAME, res);
}

export async function persistSeasons(res: Season[]): Promise<void> {
  return persist(DIR_PATH, SEASON_FILENAME, res);
}

export async function persistPlayers(res: Player[]): Promise<void> {
  return persist(DIR_PATH, PLAYER_FILENAME, res);
}

export async function persistPlayerSeasons(res: PlayerSeason[]): Promise<void> {
  return persist(DIR_PATH, PLAYER_SEASON_FILENAME, res);
}
