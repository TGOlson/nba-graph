import { League, Season } from '../../shared/nba-types';


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
  }, {});

  return Object.values(leagueMap);
};
