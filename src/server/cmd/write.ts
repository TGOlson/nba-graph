import { writeFile } from 'fs/promises';
import path from 'path';

import { League, fromSeasons } from '../scraper/league';
import { Season, getSeasons } from '../scraper/season';
import { Franchise, getActiveFranchises, getDefunctFranchises } from '../scraper/franchise';
import { getTeams, Team } from '../scraper/team';
import { getPlayers, Player } from '../scraper/player';
import { getPlayerTeams, PlayerTeam } from '../scraper/player-teams';
import { Fetch } from '../util/fetch';
import { readFranchises, readPlayers, readTeams } from './read';
import { FRANCHISE_PATH, LEAGUE_PATH, PLAYER_PATH, PLAYER_TEAM_PATH, SEASON_PATH, TEAM_PATH } from './path';

const p = (x: string) => path.resolve(__dirname, x)

async function writeJSON(pth, obj) {
  return await writeFile(pth, JSON.stringify(obj));
}

// TODO: later optimize by executing in batches
async function execSeq<T>(fns: (() => Promise<T>)[]): Promise<T[]> {
  const arr: T[] = [];
  
  let promiseExecution = async () => {
    for (let fn of fns) {
      let res = await fn();
      arr.push(res);
    }
  }

  await promiseExecution();
  return arr;
}

export async function writeSeasonsAndLeagues(fetch: Fetch): Promise<void> {
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

export async function writeFranchises(fetch: Fetch): Promise<void> {
  console.log('Fetching all active franchises...');
  const activeFranchises: Franchise[] = await getActiveFranchises(fetch);
  
  console.log('Fetching all defunct franchises...');
  const defunctFranchises: Franchise[] = await getDefunctFranchises(fetch);
  
  const franchises = [...activeFranchises, ...defunctFranchises];
  console.log(`Writing ${franchises.length} franchises to:`, FRANCHISE_PATH);
  return await writeJSON(FRANCHISE_PATH, franchises);
}

export async function writeTeams(fetch: Fetch): Promise<void> {
  console.log('Fetching teams for all franchises (this may take a while)...');
  const franchises: Franchise[] = await readFranchises();
  
  const teams: Team[] = await execSeq(franchises.map(franchise => {
    return () => getTeams(fetch, franchise)
  })).then(xs => xs.flat());
  
  console.log(`Writing ${teams.length} teams to:`, TEAM_PATH);
  return await writeJSON(TEAM_PATH, teams);
}

export async function writePlayers(fetch: Fetch): Promise<void> {
  console.log('Fetching players for all teams (this may take a while)...');
  const teams: Team[] = await readTeams();

  const players: Player[] = await execSeq(teams.map(team => {
    return () => getPlayers(fetch, team)
  })).then(xs => xs.flat());
  
  console.log(`Writing ${players.length} players to:`, PLAYER_PATH);
  return await writeJSON(PLAYER_PATH, players);
}

export async function writePlayerTeams(fetch: Fetch): Promise<void> {
  console.log('Fetch player-teams for all players (this may take a while)...');
  const players: Player[] = await readPlayers();

  const playerTeams: PlayerTeam[] = await execSeq(players.map(player => {
    return () => getPlayerTeams(fetch, player)
  })).then(xs => xs.flat());


  console.log(`Writing ${playerTeams.length} player teams to:`, PLAYER_TEAM_PATH);
  return await writeJSON(PLAYER_TEAM_PATH, playerTeams);
}
