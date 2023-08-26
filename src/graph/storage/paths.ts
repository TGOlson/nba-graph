import path from "path";
import { NBAType } from "../../shared/nba-types";

const ROOT_DIR = path.resolve(__dirname, '../data');

// parsed data
const PARSED_PATH = path.resolve(ROOT_DIR, './parsed');
export const LEAGUE_PATH = path.resolve(PARSED_PATH, 'leagues.json');
export const FRANCHISE_PATH = path.resolve(PARSED_PATH, 'franchises.json');
export const TEAM_PATH = path.resolve(PARSED_PATH, 'teams.json');
export const SEASON_PATH = path.resolve(PARSED_PATH, 'seasons.json');
export const PLAYER_PATH = path.resolve(PARSED_PATH, 'players.json');
export const PLAYER_SEASON_PATH = path.resolve(PARSED_PATH, 'player-seasons.json');

// graph data
const GRAPH_PATH = path.resolve(ROOT_DIR, './graph');
export const GRAPH_ATTRIBUTES_PATH = path.resolve(GRAPH_PATH, 'attributes.json');
export const GRAPH_OPTIONS_PATH = path.resolve(GRAPH_PATH, 'options.json');
export const GRAPH_NODES_PATH = path.resolve(GRAPH_PATH, 'nodes.json');
export const GRAPH_EDGES_PATH = path.resolve(GRAPH_PATH, 'edges.json');

// images
const IMAGE_PATH = path.resolve(ROOT_DIR, './img');
export const imageDir = (typ: NBAType) => path.resolve(IMAGE_PATH, typ.toString());
export const imgPath = (typ: NBAType, id: string, fileType: string) => path.resolve(imageDir(typ), `${id}.${fileType}`);

// sprites 
const SPRITE_PATH = path.resolve(ROOT_DIR, './sprites');
export const spritePath = (typ: NBAType) => path.resolve(SPRITE_PATH, `${typ.toString()}.png`);
export const spriteMappingPath = (typ: NBAType) => path.resolve(SPRITE_PATH, `${typ.toString()}.mapping.json`);
