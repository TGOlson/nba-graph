type AssetPathBuilder = {
  img: {
    franchiseSprite: () => string,
    teamSprite: () => string,
    playerSprite: () => string,
  }
};

export const assets: AssetPathBuilder = {
  img: {
    franchiseSprite: (): string => `/assets/sprites/franchise.png`,
    teamSprite: (): string => `/assets/sprites/team.png`,
    playerSprite: (): string => `/assets/sprites/player.png`,
  }
};
