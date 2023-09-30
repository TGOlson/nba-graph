export type Sprite = {
  key: string, 
  image: HTMLImageElement
};

export type GraphFilters = {
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
