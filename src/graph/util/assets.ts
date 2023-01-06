type AssetPathBuilder = {
  img: {
    franchise: (id: string) => string
  }
};

export const assets: AssetPathBuilder = {
  img: {
    franchise: (id: string): string => `/assets/img/franchise/${id}.png`
  }
};
