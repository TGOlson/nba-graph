export type Coordinates = {x: number, y: number};
export type Dimensions = {width: number, height: number};

export type Selection = Coordinates & Dimensions;
export type LocationMapping = {[key: string]: Selection};

export type SpriteNodeAttributes = {type: 'sprite', image: string, crop: Selection};

export type EmptyObject = Record<string, never>;
