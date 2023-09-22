export type GraphFilters = {
  // implemented
  awards: boolean;
  shortCareerPlayers: boolean;
  leagues: {
    NBA: boolean;
    ABA: boolean;
    BAA: boolean;
  };
  minYear: number;
  maxYear: number;
};
