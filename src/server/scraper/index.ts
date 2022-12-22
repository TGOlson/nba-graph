import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

import { League, fromSeasons } from './league';
import { Season, getSeasons } from './season';
import { Franchise, getActiveFranchises, getDefunctFranchises } from './franchise';
import { getTeams, Team } from './team';
import { getPlayers, Player } from './player';
import { getPlayerTeams, PlayerTeam } from './player-teams';
import { Fetch, makeFetch } from '../util/fetch';

const p = (x: string) => path.resolve(__dirname, x)

const DATA_PATH = p('../data');
const SEASON_PATH = p('../data/seasons.json');
const LEAGUE_PATH = p('../data/leagues.json');
const FRANCHISE_PATH = p('../data/franchises.json');
const TEAM_PATH = p('../data/team.json');
const PLAYER_PATH = p('../data/player.json');
const PLAYER_TEAM_PATH = p('../data/player-teams.json');

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

async function runSeasonsAndLeagues(fetch: Fetch): Promise<void> {
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

async function runFranchises(fetch: Fetch): Promise<Franchise[]> {
  console.log('Fetching all active franchises...');
  const activeFranchises: Franchise[] = await getActiveFranchises(fetch);
  
  console.log('Fetching all defunct franchises...');
  const defunctFranchises: Franchise[] = await getDefunctFranchises(fetch);
  
  const franchises = [...activeFranchises, ...defunctFranchises];
  console.log(`Writing ${franchises.length} franchises to:`, FRANCHISE_PATH);
  await writeJSON(FRANCHISE_PATH, franchises);

  return franchises;
}

async function runTeams(fetch: Fetch, franchises: Franchise[]): Promise<Team[]> {
  console.log('Fetching teams for all franchises (this may take a while)...');
  
  const teams: Team[] = await execSeq(franchises.map(franchise => {
    return () => getTeams(fetch, franchise)
  })).then(xs => xs.flat());
  
  console.log(`Writing ${teams.length} teams to:`, TEAM_PATH);
  await writeJSON(TEAM_PATH, teams);

  return teams;
}

async function runPlayers(fetch: Fetch, teams: Team[]): Promise<Player[]> {
  console.log('Fetching players for all teams (this may take a while)...');

  const players: Player[] = await execSeq(teams.map(team => {
    return () => getPlayers(fetch, team)
  })).then(xs => xs.flat());
  
  console.log(`Writing ${players.length} players to:`, PLAYER_PATH);
  await writeJSON(PLAYER_PATH, players);
  
  return players;
}

async function runPlayerTeams(fetch: Fetch, players: Player[]): Promise<PlayerTeam[]> {
  console.log('Fetch player-teams for all players (this may take a while)...');

  const playerTeams: PlayerTeam[] = await execSeq(players.map(player => {
    return () => getPlayerTeams(fetch, player)
  })).then(xs => xs.flat());


  console.log(`Writing ${playerTeams.length} player teams to:`, PLAYER_TEAM_PATH);
  await writeJSON(PLAYER_TEAM_PATH, playerTeams);

  return playerTeams;
}


export async function run() {
  console.log('*** Running scraper ***');

  console.log('Create "data" dir if it does not already exist...');
  if (!existsSync(DATA_PATH)) {
    await mkdir(DATA_PATH, {recursive: false});
  }

  const fetch: Fetch = makeFetch(true);

  await runSeasonsAndLeagues(fetch);
  const franchises = await runFranchises(fetch);
  // const teams = await runTeams(fetch, franchises);
  // const players = await runPlayers(fetch, teams);
  // await runPlayerTeams(fetch, players);

  console.log('*** Complete! ***');
}
