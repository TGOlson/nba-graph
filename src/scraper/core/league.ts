import { League, Season } from '../../shared/nba-types';
import { LEAGUES_URL, toRelative } from '../util/bref-url';

export const fromSeasons = (seasons: Season[]): League[] => {
  const leagueMap: Record<string, League> = seasons.reduce((leagueMap, season) => {
    const league = {
      id: season.leagueId,
      url: toRelative(LEAGUES_URL),
    };

    return {
      [season.leagueId]: league,
      ...leagueMap
    };
  }, {});

  return Object.values(leagueMap);
};
