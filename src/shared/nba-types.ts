export type NBAType = 
  //  'league' |
  //  'season' |
   'franchise' |
   'team' |
   'player' |
  //  'player-season' |
   'award';
 
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
  name: string,
  leagueId: string,
  image: string,
  url: string,
};

// Only for single season awards that have multiple winners (eg. all-star 2015, all-defense 2020...)
// These awards will be shown as node on the graph (hence the id)
export type MultiWinnerAward = {
  id: string,
  name: string,
  awardId: string,
  year: number,
  image: string,
  url: string,
};

// Edges between player/team nodes and awards (award node could be top-level Award or MultiWinnerAward)
export type AwardRecipient = {
  recipientId: string,
  awardId: string,
  url: string,
};

export type NBAData = {
  leagues: League[];
  seasons: Season[];
  franchises: Franchise[];
  teams: Team[];
  players: Player[];
  playerSeasons: PlayerSeason[];
  awards: Award[];
  multiWinnerAwards: MultiWinnerAward[];
  awardRecipients: AwardRecipient[];
};
