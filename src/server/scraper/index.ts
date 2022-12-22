import { League, fromSeasons } from './league';
import { Season, getSeasons } from './season';
import { Franchise, getActiveFranchises, getDefunctFranchises } from './franchise';
import { getTeams, Team } from './team';
import { getPlayers, Player } from './player';
import { getPlayerTeams, PlayerTeam } from './player-teams';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

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

export async function run() {
  console.log('*** Running scraper ***');

  console.log('Create "data" dir if it does not already exist...');
  if (!existsSync(DATA_PATH)) {
    await mkdir(DATA_PATH, {recursive: false});
  }

  // ** Seasons
  console.log('Fetching seasons...');
  const seasons: Season[] = await getSeasons();
  
  console.log('Writing seasons to:', SEASON_PATH);
  await writeJSON(SEASON_PATH, seasons);
  
  // ** Leagues
  console.log('Deriving leagues from seasons...');
  const leagues: League[] = fromSeasons(seasons);

  console.log('Writing leagues to:', LEAGUE_PATH);
  await writeJSON(LEAGUE_PATH, leagues);
  
  // ** Franchises
  console.log('Fetching all active franchises...');
  const activeFranchises: Franchise[] = await getActiveFranchises();
  
  console.log('Fetching all defunct franchises...');
  const defunctFranchises: Franchise[] = await getDefunctFranchises();
  
  const franchises = [...activeFranchises, ...defunctFranchises];
  console.log('Writing franchises to:', FRANCHISE_PATH);
  await writeJSON(FRANCHISE_PATH, franchises);

  // ** Teams
  console.log('Fetching teams for all franchises (this may take a while)...');
  const teams: Team[] = [];

  franchises.forEach(async (franchise) => {
    const team = await getTeams(franchise)
    teams.concat(team);
  });

  console.log('Writing teams to:', TEAM_PATH);
  await writeJSON(TEAM_PATH, teams);
  
  // ** Players
  console.log('Fetching players for all teams (this may take a while)...');
  const players: Player[] = [];

  teams.forEach(async (team) => {
    const player = await getPlayers(team);
    players.concat(player);
  });

  console.log('Writing players to:', PLAYER_PATH);
  await writeJSON(PLAYER_PATH, players);
  
  // ** Player Teams
  console.log('Fetch player-teams for all players (this may take a while)...');
  const playerTeams: PlayerTeam[] = [];

  players.forEach(async (player) => {
    const playerTeam = await getPlayerTeams(player);
    playerTeams.concat(playerTeam);
  })

  console.log('Writing player teams to:', PLAYER_TEAM_PATH);
  await writeJSON(PLAYER_TEAM_PATH, playerTeams);

  console.log('*** Complete! ***');
}
