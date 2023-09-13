import Color from "color";

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
    franchise: string;
    team: string;
    player: string;
    award: string;
  };
  nodeColors: {
    default: string;
    award: string;
  };
  edgeColors: {
    default: string;
    award: string;
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
  // Note: these colors are only used when a image is not defined for a node
  // This should never happen for player nodes, but may happen for franchise and team nodes
  // colors: {
  //   franchise: '#C6C3BD',
  //   team: '#C6C3BD',
  //   player: '#C6C3BD'
  // },
  nodeColors: {
    default: '#C6C3BD',
    award: '#FFFFFF',
  },
  borderColors: {
    franchise: '#FFFFFF',
    team: '#FFFFFF',
    player: '#C6C3BD',
    award: '#dd1b32',
  },
  edgeColors: {
    default: '#CCCCCC',
    award: Color('#ec9921').lighten(0.3).hex()
  },
};
