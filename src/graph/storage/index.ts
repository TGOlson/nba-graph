import { mkdir, readFile, writeFile } from "fs/promises";
import Graph from "graphology";
import path from "path";
import { Franchise, League, NBAData, NBAType, Player, PlayerSeason, Season, Team } from "../../shared/nba-types";
import { LocationMapping } from "../../shared/sprite";
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
} from './paths';

// ** read

async function readJSON<T>(p: string): Promise<T> {
  const raw = await readFile(p, 'utf8');
  return JSON.parse(raw) as T;
}

export async function loadNBAData(): Promise<NBAData> {
  const leagues: League[] = await readJSON(LEAGUE_PATH);
  const franchises: Franchise[] = await readJSON(FRANCHISE_PATH);
  const teams: Team[] = await readJSON(TEAM_PATH);
  const seasons: Season[] = await readJSON(SEASON_PATH);
  const players: Player[] = await readJSON(PLAYER_PATH);
  const playerSeasons: PlayerSeason[] = await readJSON(PLAYER_SEASON_PATH);

  return {leagues, franchises, teams, seasons, players, playerSeasons};
}

export async function loadSpriteMapping(typ: NBAType): Promise<LocationMapping> {
  return readJSON(spriteMappingPath(typ));
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


export async function persistGraph(graph: Graph): Promise<void> {
  const {attributes, options, nodes, edges} = graph.export();

  await persistJSON(GRAPH_ATTRIBUTES_PATH)(attributes);
  await persistJSON(GRAPH_OPTIONS_PATH)(options);
  await persistJSON(GRAPH_NODES_PATH)(nodes);
  return persistJSON(GRAPH_EDGES_PATH)(edges);
}

export async function persistImage(typ: NBAType, id: string, img: Buffer): Promise<void> {
  return writeFileInternal(imgPath(typ, id), img);
}

// export async function persistSprite(typ: SpriteType, img: Buffer, mapping?: Mapping): Promise<void> {
//   console.log(IMAGE_PATH, FRANCHISE_IMAGE_DIR ,SPRITE_PATH);
//   if (mapping) {
//     await persistJSON(SPRITE_PATH, spriteMappingFileName(typ))(mapping);
//   }

//   return writeFileInternal(SPRITE_PATH, spriteFileName(typ), img);
// }
