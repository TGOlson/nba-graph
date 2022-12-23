import type { Season } from './season';

export type League = {
  id: string;
  url: string;
}

const RELATIVE_URL = '/leagues';

export const fromSeasons = (seasons: Season[]): League[] => {
  const leagueMap: Record<string, League> = seasons.reduce((leagueMap, season) => {
    const league = {
      id: season.leagueId,
      url: RELATIVE_URL,
    };

    return {
      [season.leagueId]: league,
      ...leagueMap
    };
  }, {})

  return Object.values(leagueMap);
}
