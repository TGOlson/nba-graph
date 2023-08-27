export type GraphConfig = {
  startYear: number | null;
  endYear: number | null;
  sizes: {
    franchise: number;
    team: number;
    playerMax: number;
    playerDefault: number;
    playerMin: number;
  };
  colors: {
    franchise: string;
    team: string;
    player: string;
  };
  defaultBorderColors: {
    franchise: string;
    team: string;
    player: string;
  };
  defaultEdgeColor: string;
};

export const GRAPH_CONFIG: GraphConfig = {
  startYear: null,
  endYear: 2023,
  sizes: {
    franchise: 8,
    team: 5,
    playerMax: 6,
    playerDefault: 3,
    playerMin: 2
  },
  colors: {
    franchise: 'green',
    team: 'purple',
    player: '#d1d4e7'
  },
  defaultBorderColors: {
    franchise: '#CCCCCC',
    team: '#CCCCCC',
    player: '#FFFFFF'
  },
  defaultEdgeColor: '#CCCCCC',
};
