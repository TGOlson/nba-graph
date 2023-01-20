type AssetPathBuilder = {
  img: {
    franchise: (id: string) => string,
    team: (id: string) => string
  }
};

export const assets: AssetPathBuilder = {
  img: {
    franchise: (id: string): string => `/assets/img/franchise/${id}.png`,
    team: (id: string): string => `/assets/img/team/${id}.png`
  }
};
