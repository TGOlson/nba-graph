export type GraphConfig = {
  startYear: number | null;
  useYearSpecificTeamLogos: boolean; // slower to load, if false just uses franchise logos (not year specific team logos)
  includeFranchises: boolean;
  includeDefunct: boolean;
  assignLocations: boolean; // slower, useful to disable for testing
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
};

export const GRAPH_CONFIG: GraphConfig = {
  startYear: null,
  useYearSpecificTeamLogos: true,
  includeFranchises: true,
  includeDefunct: true,
  assignLocations: true,
  sizes: {
    franchise: 5,
    team: 4,
    playerMax: 4,
    playerDefault: 3,
    playerMin: 2
  },
  colors: {
    franchise: 'green',
    team: 'purple',
    player: '#d1d4e7'
  },
};
