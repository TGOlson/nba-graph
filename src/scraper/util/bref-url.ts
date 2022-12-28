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
export const playerUrl = (playerId: string): string => `${PLAYERS_URL}/${playerId[0]}/${playerId}`;

// takes a url like: https://www.basketball-reference.com/teams/MIN.html
// and returns a local path: <pwd>/data/www.basketball-reference.com/teams/MIN.html
export const localPath = (url: string): {dirPath: string, filePath: string, fileName: string} => {
  const pieces = url.split('/').slice(1);
  const nPieces = pieces.length;

  const fileName = `${pieces[nPieces - 1]}.html`;
  const dirPath = path.resolve(__dirname, '../data', ...pieces.slice(0, nPieces - 1));
  const filePath = path.resolve(dirPath, fileName);

  return {dirPath, filePath, fileName};
};
