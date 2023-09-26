export type GraphConfig = {
  startYear: number | null;
  endYear: number | null;
  sizes: {
    league: number;
    season: number;
    franchise: number;
    team: number;
    playerMax: number;
    playerDefault: number;
    playerMin: number;
    awardMax: number;
    awardDefault: number;
    awardMin: number;
  };
  borderColors: {
    team: string;
    player: string;
  };
  nodeColors: {
    default: string;
  };
  edgeColors: {
    default: string;
  };
};

export const GRAPH_CONFIG: GraphConfig = {
  startYear: null,
  endYear: 2023,
  sizes: {
    league: 15,
    season: 6,
    franchise: 10,
    team: 5,
    playerMax: 8,
    playerDefault: 3,
    playerMin: 2,
    awardMax: 12,
    awardDefault: 9,
    awardMin: 6,
  },
  nodeColors: {
    default: '#C6C3BD', // need this for opacity background on hover
  },
  borderColors: {
    team: '#FFFFFF',
    player: '#DDE7EE',
  },
  edgeColors: {
    default: '#CCCCCC',
  },
};
