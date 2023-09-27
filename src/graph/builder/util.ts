import { uniqBy } from "ramda";

import { Award, MultiWinnerAward, NBAData } from "../../shared/nba-types";
import { SeasonToken } from "../../shared/types";
import { GraphConfig } from "./config";


export const filterYears = (data: NBAData, config: GraphConfig): NBAData => {
  const startYear = config.startYear ?? 0; 
  const endYear = config.endYear ?? Infinity;

  const seasons = data.seasons.filter(({year}) => year >= startYear && year <= endYear);
  const teams = data.teams.filter(({year}) => year >= startYear && year <= endYear);
  const playerSeasons = data.playerSeasons.filter(({year}) => year >= startYear && year <= endYear);
  // const awards = data.awards.filter(({year}) => !year || (year >= startYear && year <= endYear));
  const awardRecipients = data.awardRecipients.filter(({year}) => !year || (year >= startYear && year <= endYear));
  const multiWinnerAwards = data.multiWinnerAwards.filter(({year}) => year >= startYear && year <= endYear);

  return {
    ...data,
    seasons,
    teams,
    playerSeasons,
    // awards,
    awardRecipients,
    multiWinnerAwards,
  };
};

export const toMap = <T>(key: (t: T) => string, arr: T[]): {[key: string]: T} => {
  return arr.reduce<{[key: string]: T}>((acc, x) => {
    acc[key(x)] = x;
    return acc;
  }, {});
};

export const dedupeSeasonTokens = (seasons: SeasonToken[]): SeasonToken[] => {
  return uniqBy(x => `${x.leagueId}-${x.year}`, seasons);
};

// current delta between player default size and max is 5
// get one point for each:
// 5+ time all-star
// 10+ time all-star
// x mvp
// x hof
// x 75th anniversary team
// -- maybe -- ?
// dpoy
// finals mvp?
export const getPlayerNodeSize = (config: GraphConfig, awards: (Award | MultiWinnerAward)[]): number => {
  const nTimeMvp = awards.filter(x => x.image.id === 'mvp').length;
  const isFmvp = awards.some(x => x.image.id === 'finals_mvp');
  const isHof = awards.some(x => x.id === 'HOF');
  const isTop75 = awards.some(x => x.id === 'NBA_75_ANNIVERSARY');
  const nTimeAllStar = awards.filter(x => 'awardId' in x && (x.awardId === 'ALL_STAR_NBA' || x.awardId === 'ALL_STAR_ABA')).length;
  const isDpoy = awards.some(x => x.id.includes('DPOY_'));

  const points = 
    nTimeMvp + 
    (isFmvp ? 1 : 0) + 
    (isHof ? 1 : 0) + 
    (isTop75 ? 1 : 0) + 
    (isDpoy ? 1 : 0) + 
    (nTimeAllStar >= 3 ? 1 : 0) + 
    (nTimeAllStar >= 8 ? 1 : 0);

  return Math.min(config.sizes.playerMax, config.sizes.playerDefault + points);
};
