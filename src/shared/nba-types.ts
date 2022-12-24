export type Franchise = {
  id: string;
  name: string;
  url: string;
  active: boolean;
};

export type League = {
  id: string;
  url: string;
};

export type Team = {
  id: string;
  franchiseId: string;
  seasonId: string;
  name: string;
  year: number;
  url: string;
};

export type Season = {
  id: string;
  leagueId: string;
  year: number;
  url: string;
};

export type Player = {
  id: string;
  name: string;
  url: string;
};

export type PlayerTeam = {
  playerId: string;
  teamId: string;
  url: string;
};
