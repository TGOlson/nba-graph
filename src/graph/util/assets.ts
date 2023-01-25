type AssetPathBuilder = {
  img: {
    teamSprite: () => string,
    franchiseSprite: () => string,
  }
};

export const assets: AssetPathBuilder = {
  img: {
    teamSprite: (): string => `/assets/sprites/team.png`,
    franchiseSprite: (): string => `/assets/sprites/franchise.png`,
  }
};
