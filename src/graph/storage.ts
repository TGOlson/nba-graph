import { mkdir, readFile, writeFile } from "fs/promises";
import Graph from "graphology";
import path from "path";
import { Franchise, League, NBAData, Player, PlayerSeason, Season, Team } from "../shared/nba-types";

// parsed data
const PARSED_PATH = path.resolve(__dirname, '../data/parsed');
const LEAGUE_FILENAME = 'leagues.json';
const FRANCHISE_FILENAME = 'franchises.json';
const TEAM_FILENAME = 'teams.json';
const SEASON_FILENAME = 'seasons.json';
const PLAYER_FILENAME = 'players.json';
const PLAYER_SEASON_FILENAME = 'player-seasons.json';

// graph data
const GRAPH_PATH = path.resolve(__dirname, '../data/graph');
const GRAPH_ATTRIBUTES_FILENAME = 'attributes.json';
const GRAPH_OPTIONS_FILENAME = 'options.json';
const GRAPH_NODES_FILENAME = 'nodes.json';
const GRAPH_EDGES_FILENAME = 'edges.json';

// image data
const IMAGE_PATH = path.resolve(__dirname, '../data/img');
export const FRANCHISE_IMAGE_DIR = path.resolve(IMAGE_PATH, 'franchise');
export const imgFileName = (id: string) => `${id}.png`;

export type Persist<T> = (x: T) => Promise<void>;

async function writeFileInternal(dir: string, fileName: string, data: string | Buffer): Promise<void> {
  const filePath = path.resolve(dir, fileName);
  console.log('Saving output to:', filePath);
  
  await mkdir(dir, { recursive: true });
  
  return await writeFile(filePath, data);
}

function persistJSON<T> (dir: string, fileName: string): Persist<T> {
  return async (x: T): Promise<void> => {
    return writeFileInternal(dir, fileName, JSON.stringify(x));
  };
}

export const persistLeagues: Persist<League[]> = persistJSON(PARSED_PATH, LEAGUE_FILENAME);
export const persistFranchises: Persist<Franchise[]> = persistJSON(PARSED_PATH, FRANCHISE_FILENAME);
export const persistTeams: Persist<Team[]> = persistJSON(PARSED_PATH, TEAM_FILENAME);
export const persistSeasons: Persist<Season[]> = persistJSON(PARSED_PATH, SEASON_FILENAME);
export const persistPlayers: Persist<Player[]> = persistJSON(PARSED_PATH, PLAYER_FILENAME);
export const persistPlayerSeasons: Persist<PlayerSeason[]> = persistJSON(PARSED_PATH, PLAYER_SEASON_FILENAME);

export async function readJSON<T>(dir: string, fileName: string): Promise<T> {
  const raw = await readFile(path.resolve(dir, fileName), 'utf8');
  return JSON.parse(raw) as T;
}

export async function loadNBAData(): Promise<NBAData> {
  const leagues: League[] = await readJSON(PARSED_PATH, LEAGUE_FILENAME);
  const franchises: Franchise[] = await readJSON(PARSED_PATH, FRANCHISE_FILENAME);
  const teams: Team[] = await readJSON(PARSED_PATH, TEAM_FILENAME);
  const seasons: Season[] = await readJSON(PARSED_PATH, SEASON_FILENAME);
  const players: Player[] = await readJSON(PARSED_PATH, PLAYER_FILENAME);
  const playerSeasons: PlayerSeason[] = await readJSON(PARSED_PATH, PLAYER_SEASON_FILENAME);

  return {leagues, franchises, teams, seasons, players, playerSeasons};
}


export async function persistGraph(graph: Graph): Promise<void> {
  const {attributes, options, nodes, edges} = graph.export();

  await persistJSON(GRAPH_PATH, GRAPH_ATTRIBUTES_FILENAME)(attributes);
  await persistJSON(GRAPH_PATH, GRAPH_OPTIONS_FILENAME)(options);
  await persistJSON(GRAPH_PATH, GRAPH_NODES_FILENAME)(nodes);
  return persistJSON(GRAPH_PATH, GRAPH_EDGES_FILENAME)(edges);
}

export async function persistImage(namespace: string, id: string, img: Buffer): Promise<void> {
  return writeFileInternal(path.resolve(IMAGE_PATH, namespace), imgFileName(id), img);
}
