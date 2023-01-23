type AssetPathBuilder = {
  img: {
    franchise: (id: string) => string,
    team: (id: string) => string,
    teamSprite: () => string,
    franchiseSprite: () => string,
  }
};

export const assets: AssetPathBuilder = {
  img: {
    franchise: (id: string): string => `/assets/img/franchise/${id}.png`,
    team: (id: string): string => `/assets/img/team/${id}.png`,
    teamSprite: (): string => `/assets/sprites/team.png`,
    franchiseSprite: (): string => `/assets/sprites/franchise.png`,
  }
};
