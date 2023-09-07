import { NBAType } from "./nba-types";

export type Coordinates = {x: number, y: number};
export type Dimensions = {width: number, height: number};

export type Selection = Coordinates & Dimensions;
export type SelectionMap = {[key: string]: Selection};

export type Palette = {primary: string, light: string, dark: string};

export type CustomNodeAttributes = {muted?: boolean, borderColor: string} & SpriteNodeAttributes;
export type SpriteNodeAttributes = {type: 'sprite', image: string, crop: Selection};

export type EmptyObject = Record<string, never>;

export type BaseNodeAttributes = {
  nbaType: NBAType;
  color: string;
  borderColor: string;
  size: number;
  label: string;
} & SpriteNodeAttributes;

export type PlayerNodeAttributes = BaseNodeAttributes & {
  nbaType: 'player';
  years: string;
};

export type FranchiseNodeAttributes = BaseNodeAttributes & {
  nbaType: 'franchise';
};

export type TeamNodeAttributes = BaseNodeAttributes & {
  nbaType: 'team';
};
