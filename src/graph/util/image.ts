import { readdir } from 'fs/promises';
import Jimp from 'jimp';
import path from 'path';
import Vibrant from 'node-vibrant';

import { loadSpriteMapping, persistJSON } from '../storage';
import {createSprite, ImageSource, Sprite} from 'quick-sprite';
import { NBAType } from '../../shared/nba-types';
import { Palette } from '../../shared/types';
import { spritePath } from '../storage/paths';

const MAX_WIDTH = 3072;
const TEAM_IMAGE_SIZE = 205;
const TEAM_IMAGE_PADDING = 40;
const PLAYER_IMAGE_SIZE = 120;
const PLAYER_IMAGE_X_PADDING = 15;
const PLAYER_IMAGE_TOP_PADDING = 10;

export const noopTransform = (_key: string, image: Jimp): Jimp => image;

// Note: team and franchise photos are downlaoaded as 125x125 squares
// Since they will be rendered within a circle, add extra padding so that none of the base image is clipped
export const teamTransform = (_key: string, image: Jimp): Jimp => {
  const base = new Jimp(TEAM_IMAGE_SIZE, TEAM_IMAGE_SIZE, '#ffffff');
  const resized = image.resize(TEAM_IMAGE_SIZE - (TEAM_IMAGE_PADDING * 2), Jimp.AUTO);

  return base.composite(resized, TEAM_IMAGE_PADDING, TEAM_IMAGE_PADDING);
};

// Note: player images are 120x180 rectangles
// Resize to 90px wide, then add 15px padding to the left and right
// We could keep at higher res, but player pictures don't need that much detail, and this saves space
// TODO: maybe find a way to keep most important player images larger (based on award?)
export const playerTransform = (_key: string, image: Jimp): Jimp => {
  const base = new Jimp(PLAYER_IMAGE_SIZE, PLAYER_IMAGE_SIZE, '#ffffff');

  const resized = image.autocrop({
    cropOnlyFrames: false,
    tolerance: 0.001,
    leaveBorder: PLAYER_IMAGE_TOP_PADDING,
    ignoreSides: {
      north: false,
      south: true,
      east: true,
      west: true,
    }
  }).resize(PLAYER_IMAGE_SIZE - (PLAYER_IMAGE_X_PADDING * 2), Jimp.AUTO);

  return base.composite(resized, PLAYER_IMAGE_X_PADDING, PLAYER_IMAGE_TOP_PADDING);
};

export async function createSpriteImage(inputDir: string, imagePath: string, mappingPath: string, transform?: (_key: string, image: Jimp) => Jimp): Promise<void> {
  const fileNames: string[] = await readdir(inputDir);
  const sources: ImageSource[] = fileNames.map(f => {
    const key = f.split('.')[0];
    if (!key) throw new Error(`Unable to parse key for: ${f}`);

    return {key, path: path.resolve(inputDir, f)};
  });

  const {image, mapping}: Sprite = await createSprite(sources, {
    fillMode: 'row',
    maxWidth: MAX_WIDTH,
    dedupe: {diffPercent: 0},
    transform,
    debug: true,
  });

  await image.writeAsync(imagePath);

  await persistJSON(mappingPath)(mapping);
}

export async function parseColorPalette(img: Jimp): Promise<Partial<Palette>> {
  const buffer = await img.getBufferAsync(Jimp.MIME_PNG);
  const palette = await Vibrant.from(buffer).quality(1).getPalette();

  return {
    primary: palette.Vibrant?.hex,
    light: palette.LightVibrant?.hex,
    dark: palette.DarkVibrant?.hex,
  };
}

export async function eachSpriteImage(typ: NBAType, fn: (key: string, img: Jimp) => Promise<void>): Promise<void> {
  const sprite = await Jimp.read(spritePath(typ));
  const spriteMapping = await loadSpriteMapping(typ);

  for (const [key, coords] of Object.entries(spriteMapping)) {
    const img = sprite.clone().crop(coords.x, coords.y, coords.width, coords.height);
    await fn(key, img);
  }
}

export async function parseSpriteColorPallette(typ: NBAType): Promise<{[key: string]: Palette}> {
  const res: {[key: string]: Palette} = {};

  await eachSpriteImage(typ, async (key, img) => {
    const palette = await parseColorPalette(img);

    if (!isFullPallette(palette)) throw new Error(`Unexpected partial palette for: ${key}`);

    res[key] = palette;
  });

  return res;
}

const isFullPallette = (palette: Partial<Palette>): palette is Palette => {
  return !!palette.primary && !!palette.light && !!palette.dark;
};
