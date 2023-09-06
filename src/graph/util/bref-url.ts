import path from "path";
import { Season } from "../../shared/nba-types";

const BASE_URL = 'https://www.basketball-reference.com';

// Small util functions to compact/expand urls
// Currently hardcoded to only work with basketball-refernece,
// but could be expanded in the future.
// Useful to reduce latency when sending all graph data across a network
//
// Example:
//   Compact('https://www.basketball-reference.com/teams/MIN/')
//   -> '/teams/MIN/'
//
//   Expand('/teams/MIN/')
//   -> 'https://www.basketball-reference.com/teams/MIN/'

export const toRelative = (str: string): string =>
    str.replace(BASE_URL, '');

const fromRelative = (str: string): string => 
  `${BASE_URL}${str}`;

export const LEAGUES_URL = fromRelative('/leagues');
export const TEAMS_URL = fromRelative('/teams');
export const PLAYERS_URL = fromRelative('/players');

export const awards = {
  MVP_AWARD_URL: fromRelative('/awards/mvp.html'),
  DPOY_AWARD_URL: fromRelative('/awards/dpoy.html'),
  ROY_AWARD_URL: fromRelative('/awards/roy.html'),
  SMOY_AWARD_URL: fromRelative('/awards/smoy.html'),
  MIP_AWARD_URL: fromRelative('/awards/mip.html'),
  TMOY_AWARD_URL: fromRelative('/awards/tmoy.html'),
  CITIZEN_AWARD_URL: fromRelative('/awards/citizenship.html'),
  ASMVP_AWARD_URL: fromRelative('/awards/all_star_mvp.html'),
  FMVP_AWARD_URL: fromRelative('/awards/finals_mvp.html'),
  ALLNBA_AWARD_URL: fromRelative('/awards/all_league.html'),
  ALLROOK_AWARD_URL: fromRelative('/awards/all_rookie.html'),
  ALLDEF_AWARD_URL: fromRelative('/awards/all_defense.html'),
  HOF_AWARD_URL: fromRelative('/awards/hof.html'),
  ANNI75_AWARD_URL: fromRelative('/awards/nba_75th_anniversary.html'),
  ANNI50_AWARD_URL: fromRelative('/awards/nba_50_greatest.html'),
  BSHOF_AWARD_URL: fromRelative('/awards/simmons_pyramid.html'),
  ABAALLTIME_AWARD_URL: fromRelative('/awards/aba_all_time_team.html '),
};

const ALL_STAR_URL = fromRelative('/allstar');

export const validAllStarSeasons = (seasons: Season[]): Season[] => seasons.filter(({leagueId, year}) => {
  return (leagueId === 'NBA' && year >= 1951 && year <= 2023 && year !== 1999) || 
    (leagueId === 'ABA' && year >= 1968 && year <= 1976);
});

export const allStarUrl = (seasonId: string): string => `${ALL_STAR_URL}/${seasonId}.html`;
export const LEAGUE_CHAMP_URL = fromRelative('/playoffs');

export const teamUrl = (franchiseId: string): string => `${TEAMS_URL}/${franchiseId}`;
export const playerIndexUrl = (firstLetterLastName: string): string => `${PLAYERS_URL}/${firstLetterLastName}`;
export const playerUrl = (playerId: string): string => `${PLAYERS_URL}/${playerId[0] ?? '_'}/${playerId}.html`;

// takes a url like: https://www.basketball-reference.com/teams/MIN
// and returns a local path: <pwd>/data/www.basketball-reference.com/teams/MIN.html
export const localPath = (url: string): {dirPath: string, filePath: string, fileName: string} => {
  const pieces = url.split('/').slice(1);
  const nPieces = pieces.length;
  const last = pieces[nPieces - 1];

  if (!last) throw new Error(`Bad url path: ${url}`);

  const fileName = last.includes('.html') ? last : `${last}.html`;
  const dirPath = path.resolve(__dirname, '../data', ...pieces.slice(0, nPieces - 1));
  const filePath = path.resolve(dirPath, fileName);

  return {dirPath, filePath, fileName};
};

// * Note for image urls:
// 
// This is a pretty big hack that uses an expected URL pattern this is likely to change over time
// However, it is much easier than reparsing each file (especially in the case of players, which takes a long time)
// This works fine for now (eg. running on Jan 5 2023), but will likely break in the future
//
// TODO: update this to parse urls from downloaded files instead of relying on URL pattern

const BASE_LOGO_URL = 'https://cdn.ssref.net/req/202301032/tlogo/bbr/';
const LOGO_SUFFIX = '.png';

export const getFranchiseLogoUrl = (franchiseId: string): string =>
    `${BASE_LOGO_URL}${franchiseId}${LOGO_SUFFIX}`;

export const getTeamLogoUrl = (yearAppropriateFranchiseId: string, year: number): string =>
  `${BASE_LOGO_URL}${yearAppropriateFranchiseId}-${year}${LOGO_SUFFIX}`;

export const getPlayerImageUrl = (playerId: string): string =>
  `https://www.basketball-reference.com/req/202106291/images/players/${playerId}.jpg`;
  