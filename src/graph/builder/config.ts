export type GraphConfig = {
  startYear: number;
  includeDefunct: boolean;
  includeTeamLogos: boolean; // slower to load, if false just uses franchise logos (not year specific team logos)
  assignLocations: boolean; // slower, useful to disable for testing
};

export const GRAPH_CONFIG = {
  startYear: 2000,
  includeDefunct: true,
  includeTeamLogos: true,
  assignLocations: true,
};
