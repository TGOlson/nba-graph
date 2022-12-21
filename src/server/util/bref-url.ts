const BASE_URL = "https://www.basketball-reference.com"
const BR_SYMBOL = "{br}"

export type BrefURL = {
	x: string;
}

// Small util functions to compact/expand urls using bbref placeholder
// Currently hardcoded to only work with basketball-refernece,
// but could be expanded in the future.
// Useful to reduce latency when sending all graph data across a network
//
// Example:
//   Compact("https://www.basketball-reference.com/teams/MIN/")
//   -> "{br}/teams/MIN/"
//
//   Expand("{br}/teams/MIN/")
//   -> "https://www.basketball-reference.com/teams/MIN/"

export const compact = (str: string): BrefURL => ({
    x: str.replace(BASE_URL, BR_SYMBOL)
  });

export const expand = (url: BrefURL): string => 
  url.x.replace(BR_SYMBOL, BASE_URL);

export const fromRelative = (str: string): string => 
  `${BASE_URL}${str}`;
