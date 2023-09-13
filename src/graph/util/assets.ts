
export type LeagueId = 'NBA' | 'ABA' | 'BAA';
export type AwardImageId = 'allstar' | 'allstar_aba' | 'allstar_mvp' | 'champ' | 'finals_mvp' | 'mvp' | 'trophy' | 'hof';

export const assets = {
  img: {
    franchiseSprite: '/assets/sprites/franchise.png',
    franchiseDefault: '/assets/img/team_default.png',
    teamSprite: '/assets/sprites/team.png',
    teamDefault: '/assets/img/team_default.png',
    playerSprite: '/assets/sprites/player.png',
    playerDefault: '/assets/img/player_default.png',
    leagueSprite: '/assets/sprites/league.png',
    awardSprite: '/assets/sprites/award.png',
    // league: {
    //   aba: '/assets/img/league/ABA.png',
    //   baa: '/assets/img/league/BAA.png',
    //   nba: '/assets/img/league/NBA.png',
    // },
    // award: {
    //   // multi winner awards
    //   allstar: '/assets/img/award/allstar.png',
    //   allstar_aba: '/assets/img/award/allstar_aba.png',
      
    //   // single winner awards
    //   allstar_mvp: '/assets/img/award/allstar_mvp.png',
    //   champ: '/assets/img/award/champ.png',
    //   finals_mvp: '/assets/img/award/finals_mvp.png',
    //   mvp: '/assets/img/award/mvp.png',
    //   trophy: '/assets/img/award/trophy.png',

    //   // lifetime awards
    //   hof: '/assets/img/award/hof.png',
    // }
  }
};
