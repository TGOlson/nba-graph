import { mkdir, readFile, writeFile } from "fs/promises";
import Graph from "graphology";
import path from "path";

import { Award, Franchise, League, NBAData, NBAType, Player, PlayerSeason, Season, MultiWinnerAward, Team, AwardRecipient } from "../../shared/nba-types";
import { Palette, SelectionMap } from "../../shared/types";

import {
  LEAGUE_PATH,
  FRANCHISE_PATH,
  TEAM_PATH,
  SEASON_PATH,
  PLAYER_PATH,
  PLAYER_SEASON_PATH,
  GRAPH_ATTRIBUTES_PATH,
  GRAPH_OPTIONS_PATH,
  GRAPH_NODES_PATH,
  GRAPH_EDGES_PATH,
  spriteMappingPath,
  imgPath,
  spriteColorsPath,
  AWARD_PATH,
  MULTI_WINNER_AWARD_PATH,
  AWARD_RECIPIENT_PATH,
} from './paths';

// ** read

type Read<T> = () => Promise<T>;

function readJSON<T>(p: string): Read<T> {
  return async () => {
    const raw = await readFile(p, 'utf8');
    return JSON.parse(raw) as T;
  };
}

export const loadLeagues: Read<League[]> = readJSON(LEAGUE_PATH);
export const loadFranchises: Read<Franchise[]> = readJSON(FRANCHISE_PATH);
export const loadTeams: Read<Team[]> = readJSON(TEAM_PATH);
export const loadSeasons: Read<Season[]> = readJSON(SEASON_PATH);
export const loadPlayers: Read<Player[]> = readJSON(PLAYER_PATH);
export const loadPlayerSeasons: Read<PlayerSeason[]> = readJSON(PLAYER_SEASON_PATH);
export const loadAwards: Read<Award[]> = readJSON(AWARD_PATH);
export const loadMultiWinnerAwards: Read<MultiWinnerAward[]> = readJSON(MULTI_WINNER_AWARD_PATH);
export const loadAwardRecipients: Read<AwardRecipient[]> = readJSON(AWARD_RECIPIENT_PATH);

export async function loadNBAData(): Promise<NBAData> {
  const leagues: League[] = await loadLeagues();
  const franchises: Franchise[] = await loadFranchises();
  const teams: Team[] = await loadTeams();
  const seasons: Season[] = await loadSeasons();
  const players: Player[] = await loadPlayers();
  const playerSeasons: PlayerSeason[] = await loadPlayerSeasons();
  const awards: Award[] = await loadAwards();
  const multiWinnerAwards: MultiWinnerAward[] = await loadMultiWinnerAwards();
  const awardRecipients: AwardRecipient[] = await loadAwardRecipients();

  return {
    leagues, 
    franchises, 
    teams, 
    seasons, 
    players, 
    playerSeasons, 
    awards, 
    multiWinnerAwards, 
    awardRecipients
  };
}

export function loadSpriteMapping(typ: NBAType): Promise<SelectionMap> {
  const reader: Read<SelectionMap> = readJSON(spriteMappingPath(typ));
  return reader();
}

export function loadSpriteColors(typ: NBAType): Promise<{[key: string]: Palette}> {
  const reader: Read<{[key: string]: Palette}> = readJSON(spriteColorsPath(typ));
  return reader();
}

// ** write

export type Persist<T> = (x: T) => Promise<void>;

async function writeFileInternal(p: string, data: string | Buffer): Promise<void> {
  console.log('Saving output to:', p);
  
  const dir = path.dirname(p);
  await mkdir(dir, { recursive: true });
  
  return await writeFile(p, data);
}

export function persistJSON<T> (p: string): Persist<T> {
  return async (x: T): Promise<void> => {
    return writeFileInternal(p, JSON.stringify(x));
  };
}

export const persistLeagues: Persist<League[]> = persistJSON(LEAGUE_PATH);
export const persistFranchises: Persist<Franchise[]> = persistJSON(FRANCHISE_PATH);
export const persistTeams: Persist<Team[]> = persistJSON(TEAM_PATH);
export const persistSeasons: Persist<Season[]> = persistJSON(SEASON_PATH);
export const persistPlayers: Persist<Player[]> = persistJSON(PLAYER_PATH);
export const persistPlayerSeasons: Persist<PlayerSeason[]> = persistJSON(PLAYER_SEASON_PATH);
export const persistAwards: Persist<Award[]> = persistJSON(AWARD_PATH);
export const persistMultiWinnerAwards: Persist<MultiWinnerAward[]> = persistJSON(MULTI_WINNER_AWARD_PATH);
export const persistAwardRecipients: Persist<AwardRecipient[]> = persistJSON(AWARD_RECIPIENT_PATH);

export async function persistGraph(graph: Graph): Promise<void> {
  const {attributes, options, nodes, edges} = graph.export();

  await persistJSON(GRAPH_ATTRIBUTES_PATH)(attributes);
  await persistJSON(GRAPH_OPTIONS_PATH)(options);
  await persistJSON(GRAPH_NODES_PATH)(nodes);
  return persistJSON(GRAPH_EDGES_PATH)(edges);
}

export async function persistImage(typ: NBAType, id: string, img: Buffer, fileType: string): Promise<void> {
  return writeFileInternal(imgPath(typ, id, fileType), img);
}
