export type GraphConfig = {
  startYear: number;
  includeDefunct: boolean;
  assignLocations: boolean; // slower, useful to disable for testing
};

export const GRAPH_CONFIG = {
  startYear: 2020,
  includeDefunct: true,
  assignLocations: true,
};
