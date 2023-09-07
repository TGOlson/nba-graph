export enum NBAType {
  // LEAGUE = 'league',
  // SEASON = 'season',
  FRANCHISE = 'franchise',
  TEAM = 'team',
  PLAYER = 'player',
  // PLAYER_SEASON = 'player-season',
  AWARD = 'award',
}
 
// NBA, ABA...
export type League = {
  id: string;
  url: string;
};

// NBA_2015, NBA_2020...
export type Season = {
  id: string;
  leagueId: string;
  year: number;
  url: string;
};

// LAL, MIN...
export type Franchise = {
  id: string;
  name: string;
  active: boolean;
  image: string;
  url: string;
};

// LAL_2015, MIN_2020...
export type Team = {
  id: string;
  franchiseId: string;
  seasonId: string;
  name: string;
  year: number;
  image: string;
  url: string;
};

// James Harden, Steph Curry...
export type Player = {
  id: string;
  name: string;
  image: string | null;
  awards: string[]; // kind of a hack for now, later awards should be keyed by season w/ unique ids
  url: string;
};

export type PartialPlayer = Pick<Player, 'id' | 'name' | 'url'>;

// James Harden HOU_2015, James Harden BKN_2021...
export type PlayerSeason = {
  playerId: string;
  teamId: string;
  year: number; // can be derived, but convenient to have here
  url: string;
};

// MVP_NBA, DPOY_ABA...
export type Award = {
  id: string,
  leagueId: string,
  name: string,
  url: string,
};

// MVP_NBA_2015, DPOY_NBA_2015...
// Note: these awards will be shown as node on the graph (hence the id)
export type SeasonAward = {
  id: string,
  name: string,
  awardId: string,
  playerId: string,
  year: number,
  url: string,
  // TODO?
  // image: string,
};

// HOF, TOP_75...
// Note: these awards will only be shwon as edges (hence no id)
export type LifetimeAward = {
  playerId: string,
  awardId: string,
  url: string,
  // TODO?
  // image: string,
};

export type NBAData = {
  leagues: League[];
  seasons: Season[];
  franchises: Franchise[];
  teams: Team[];
  players: Player[];
  playerSeasons: PlayerSeason[];
};
