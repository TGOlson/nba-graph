type AssetPath = {
  img: {
    franchiseSprite: string,
    franchiseDefault: string,
    teamSprite: string,
    teamDefault: string,
    playerSprite: string,
    playerDefault: string,
    award: {
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
      medal: '/assets/img/award/medal.png',
      trophy: '/assets/img/award/trophy.png',
      trophy_lob: '/assets/img/award/trophy_lob.png',
      wreath: '/assets/img/award/wreath.png',
    }
  }
};
