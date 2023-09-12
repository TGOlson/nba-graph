type AssetPath = {
  img: {
    franchiseSprite: string,
    franchiseDefault: string,
    teamSprite: string,
    teamDefault: string,
    playerSprite: string,
    playerDefault: string,
    award: {
      allstar: string,
      hof: string,
      nba: string,
      medal: string,
      trophy: string,
      trophy_lob: string,
      wreath: string,
    }
  }
};

export const assets: AssetPath = {
  img: {
    franchiseSprite: '/assets/sprites/franchise.png',
    franchiseDefault: '/assets/img/team_default.png',
    teamSprite: '/assets/sprites/team.png',
    teamDefault: '/assets/img/team_default.png',
    playerSprite: '/assets/sprites/player.png',
    playerDefault: '/assets/img/player_default.png',
    award: {
      allstar: '/assets/img/award/allstar_200.png',
      nba: '/assets/img/award/nba_200.png',
      hof: '/assets/img/award/hof_200.png',
      medal: '/assets/img/award/medal_200.png',
      trophy: '/assets/img/award/trophy_200.png',
      trophy_lob: '/assets/img/award/trophy_lob_200.png',
      wreath: '/assets/img/award/wreath_200.png',
    }
  }
};
