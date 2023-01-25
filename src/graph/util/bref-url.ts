import path from "path";

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

export const fromRelative = (str: string): string => 
  `${BASE_URL}${str}`;

export const LEAGUES_URL = fromRelative('/leagues');
export const TEAMS_URL = fromRelative('/teams');
export const PLAYERS_URL = fromRelative('/players');

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

export const getTeamLogoUrl = (franchiseId: string, yearAppropriateFranchiseId: string, year: number): string =>
  `${BASE_LOGO_URL}${yearAppropriateFranchiseId}-${year}${LOGO_SUFFIX}`;

export const getPlayerImageUrl = (playerId: string): string =>
  `https://www.basketball-reference.com/req/202106291/images/players/${playerId}.jpg`;
