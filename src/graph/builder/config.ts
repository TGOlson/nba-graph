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
    league: 12,
    season: 6,
    franchise: 8,
    team: 5,
    playerMax: 6,
    playerDefault: 3,
    playerMin: 2,
    awardMax: 6,
    awardDefault: 4,
  },
  nodeColors: {
    default: '#C6C3BD', // need this for opacity background on hover
  },
  borderColors: {
    team: '#FFFFFF',
    player: '#C6C3BD',
  },
  edgeColors: {
    default: '#CCCCCC',
  },
};
