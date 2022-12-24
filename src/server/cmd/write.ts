import { writeFile } from 'fs/promises';

import { fromSeasons } from '../scraper/league';
import { getSeasons } from '../scraper/season';
import { getActiveFranchises, getDefunctFranchises } from '../scraper/franchise';
import { getTeams } from '../scraper/team';
import { getPlayers } from '../scraper/player';
import { getPlayerTeams } from '../scraper/player-teams';
import { Fetch } from '../util/fetch';
import { readFranchises, readPlayers, readTeams } from './read';
import { FRANCHISE_PATH, LEAGUE_PATH, PLAYER_PATH, PLAYER_TEAM_PATH, SEASON_PATH, TEAM_PATH } from './path';
import { Franchise, League, Player, PlayerTeam, Season, Team } from '../../shared/nba-types';

export async function writeJSON (pth: string, obj: object): Promise<void> {
  return await writeFile(pth, JSON.stringify(obj));
}

type ExecFn<T> = () => Promise<T>;

// TODO: later optimize by executing in batches
async function execSeq<T> (fns: ExecFn<T>[]): Promise<T[]> {
  const arr: T[] = [];

  const promiseExecution = async (): Promise<void> => {
    for (const fn of fns) {
      const res = await fn();
      arr.push(res);
    }
  };

  await promiseExecution();
  return arr;
}

export async function writeSeasonsAndLeagues (fetch: Fetch): Promise<void> {
  // Seasons
  console.log('Fetching seasons...');
  const seasons: Season[] = await getSeasons(fetch);

  console.log(`Writing ${seasons.length} seasons to:`, SEASON_PATH);
  await writeJSON(SEASON_PATH, seasons);

  // Leagues
  console.log('Deriving leagues from seasons...');
  const leagues: League[] = fromSeasons(seasons);

  console.log(`Writing ${leagues.length} leagues to:`, LEAGUE_PATH);
  return await writeJSON(LEAGUE_PATH, leagues);
}

export async function writeFranchises (fetch: Fetch): Promise<void> {
  console.log('Fetching all active franchises...');
  const activeFranchises: Franchise[] = await getActiveFranchises(fetch);

  console.log('Fetching all defunct franchises...');
  const defunctFranchises: Franchise[] = await getDefunctFranchises(fetch);

  const franchises = [...activeFranchises, ...defunctFranchises];
  console.log(`Writing ${franchises.length} franchises to:`, FRANCHISE_PATH);
  return await writeJSON(FRANCHISE_PATH, franchises);
}

export async function writeTeams (fetch: Fetch): Promise<void> {
  console.log('Fetching teams for all franchises (this may take a while)...');
  const franchises: Franchise[] = await readFranchises();

  const teams: Team[] = await execSeq(franchises.map(franchise => {
    return async () => await getTeams(fetch, franchise);
  })).then(xs => xs.flat());

  console.log(`Writing ${teams.length} teams to:`, TEAM_PATH);
  return await writeJSON(TEAM_PATH, teams);
}

export async function writePlayers (fetch: Fetch): Promise<void> {
  console.log('Fetching players for all teams (this may take a while)...');
  const teams: Team[] = await readTeams();

  const players: Player[] = await execSeq(teams.map(team => {
    return async () => await getPlayers(fetch, team);
  })).then(xs => xs.flat());

  const dedupedPlayers = dedupe(players);

  console.log(`Writing ${dedupedPlayers.length} players to:`, PLAYER_PATH);
  return await writeJSON(PLAYER_PATH, dedupedPlayers);
}

export async function writePlayerTeams (fetch: Fetch): Promise<void> {
  console.log('Fetch player-teams for all players (this may take a while)...');
  const players: Player[] = await readPlayers();

  const playerTeams: PlayerTeam[] = await execSeq(players.map(player => {
    return async () => await getPlayerTeams(fetch, player);
  })).then(xs => xs.flat());

  console.log(`Writing ${playerTeams.length} player teams to:`, PLAYER_TEAM_PATH);
  return await writeJSON(PLAYER_TEAM_PATH, playerTeams);
}

export const dedupe = (xs: {id: string}[]): {id: string}[] => {
  const accum: Record<string, {id: string}> = {};

  for (const x of xs) {
    accum[x.id] = x;
  }

  return Object.values(accum);
};
