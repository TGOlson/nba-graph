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
  url: string;
  active: boolean;
};

// LAL_2015, MIN_2020...
export type Team = {
  id: string;
  franchiseId: string;
  seasonId: string;
  name: string;
  year: number;
  img: string;
  url: string;
};

// James Harden, Steph Curry...
export type Player = {
  id: string;
  name: string;
  url: string;
};

// James Harden HOU_2015, James Harden BKN_2021...
export type PlayerSeason = {
  playerId: string;
  teamId: string;
  url: string;
};

export type NBAData = {
  leagues: League[];
  seasons: Season[];
  franchises: Franchise[];
  teams: Team[];
  players: Player[];
  playerSeasons: PlayerSeason[];
};
