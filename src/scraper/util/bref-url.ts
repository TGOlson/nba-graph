const BASE_URL = 'https://www.basketball-reference.com'

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
    str.replace(BASE_URL, '')

export const fromRelative = (str: string): string => 
  `${BASE_URL}${str}`;
