import { SerializedNode } from "graphology-types";
import { LeagueId, NBAType } from "./nba-types";

export type Coordinates = {x: number, y: number};
export type Dimensions = {width: number, height: number};

export type Selection = Coordinates & Dimensions;
export type SelectionMap = {[key: string]: Selection};

export type Palette = {primary: string, light: string, dark: string};

export type EmptyObject = Record<string, never>;

export type SpriteNodeAttributes = {
  type: Exclude<NBAType, 'season' | 'multi-winner-award'>, 
  image: string, 
  crop: Selection
};

// used in graph rendering
export type CustomNodeAttributes = {muted?: boolean, borderColor: string} & NodeAttributes;

export type NBAGraphNode = SerializedNode & {attributes: NodeAttributes};

export type SeasonToken = {
  leagueId: LeagueId;
  year: number;
};

// used in graph building & rendering
export type NodeAttributes = {
  // general
  nbaType: NBAType;
  name?: string; // use this for entities that have a different display name than the graph label
  label: string; // used for graph label

  // search/filter props
  seasons: SeasonToken[];
  rollupId?: string; // used for search result grouping

  // display props
  color: string;
  borderColor: string;
  size: number;
} & SpriteNodeAttributes;
