export type GraphFilters = {
  // implemented
  showAwards: boolean;
  showShortCareerPlayers: boolean;

  // need to add additional info to award, player, team and franchise nodes
  // award: league id
  // multi winner award: league id
  // player: leagues[] (array of league ids)
  // team: league id
  // franchise: leagues[] (array of league ids)
  showNBA: boolean;
  showABA: boolean;
  showBAA: boolean;

  // need to add additional info to award, player, team and franchise nodes
  // award: years[] (array of years)
  // multi winner award: year
  // player: years[] (array of years)
  // team: years (should already have this)
  // franchise: years[] (array of years)
  minYear: number;
  maxYear: number;
};
