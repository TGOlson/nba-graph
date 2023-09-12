import { NBAType } from "./nba-types";

export type Coordinates = {x: number, y: number};
export type Dimensions = {width: number, height: number};

export type Selection = Coordinates & Dimensions;
export type SelectionMap = {[key: string]: Selection};

export type Palette = {primary: string, light: string, dark: string};

export type EmptyObject = Record<string, never>;

export type SpriteNodeAttributes = {type: 'sprite', image: string, crop: Selection};

// used in graph rendering
export type CustomNodeAttributes = {muted?: boolean, borderColor: string} & SpriteNodeAttributes;

// used in graph building & rendering
export type NodeAttributes = {
  nbaType: NBAType;
  color: string;
  borderColor: string;
  size: number;
  label: string;
  leagues: string[];
  years: number[];
} & SpriteNodeAttributes;
