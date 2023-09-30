import { LeagueId } from "../../shared/nba-types";

export type Sprite = {
  key: string, 
  image: HTMLImageElement
};

export type GraphFilters = {
  awards: boolean;
  shortCareerPlayers: boolean;
  leagues: Record<LeagueId, boolean>;
  minYear: number;
  maxYear: number;
};
