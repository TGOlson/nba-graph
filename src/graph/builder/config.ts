export type GraphConfig = {
  startYear: number;
  includeDefunct: boolean;
  assignLocations: boolean; // slower, useful to disable for testing
};

export const GRAPH_CONFIG = {
  startYear: 1980,
  includeDefunct: true,
  assignLocations: false,
};
