import { NBAType } from "./nba-types";

export type Coordinates = {x: number, y: number};
export type Dimensions = {width: number, height: number};

export type Selection = Coordinates & Dimensions;
export type SelectionMap = {[key: string]: Selection};

export type Palette = {primary: string, light: string, dark: string};

export type CustomNodeAttributes = {muted?: boolean, borderColor: string} & (SpriteNodeAttributes | EmptyObject);
export type SpriteNodeAttributes = {type: 'sprite', image: string, crop: Selection};

export type EmptyObject = Record<string, never>;


export type BaseNodeAttributes = {
  nbaType: NBAType;
  color: string;
  borderColor: string;
  size: number;
  label: string;
} & (SpriteNodeAttributes | EmptyObject);

export type PlayerNodeAttributes = BaseNodeAttributes & {
  nbaType: NBAType.PLAYER;
  years: string;
};

export type FranchiseNodeAttributes = BaseNodeAttributes & {
  nbaType: NBAType.FRANCHISE;
};

export type TeamNodeAttributes = BaseNodeAttributes & {
  nbaType: NBAType.TEAM;
};
