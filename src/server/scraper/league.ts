import type { Season } from './season';
import { BrefURL, fromRelative, compact } from '../util/bref-url';

export type League = {
	id: string;
	url: BrefURL;
}

const RELATIVE_URL = '/leagues';

export const fromSeasons = (seasons: Season[]): League[] => {
  const url = compact(fromRelative(RELATIVE_URL));

  const leagueMap: {[key: string]: League} = seasons.reduce((leagueMap, season) => {
    const league = {
      id: season.leagueId,
      url,
    };

    return {
      [season.leagueId]: league,
      ...leagueMap
    };
  }, {})

  return Object.values(leagueMap);
}
