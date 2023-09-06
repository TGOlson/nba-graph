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
  defaultBorderColors: {
    franchise: string;
    team: string;
    player: string;
  };
  defaultNodeColor: string;
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
  // Note: these colors are only used when a image is not defined for a node
  // This should never happen for player nodes, but may happen for franchise and team nodes
  // colors: {
  //   franchise: '#C6C3BD',
  //   team: '#C6C3BD',
  //   player: '#C6C3BD'
  // },
  defaultNodeColor: '#C6C3BD',
  defaultBorderColors: {
    franchise: '#FFFFFF',
    team: '#FFFFFF',
    player: '#FFFFFF'
  },
  defaultEdgeColor: '#CCCCCC',
};
