export type GraphConfig = {
  startYear: number;
  useYearSpecificTeamLogos: boolean; // slower to load, if false just uses franchise logos (not year specific team logos)
  includeFranchises: boolean;
  includeDefunct: boolean;
  assignLocations: boolean; // slower, useful to disable for testing
};

export const GRAPH_CONFIG = {
  startYear: 2022,
  useYearSpecificTeamLogos: false,
  includeFranchises: false,
  includeDefunct: true,
  assignLocations: true,
};
