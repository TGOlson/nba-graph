import { readdir } from 'fs/promises';
import Jimp from 'jimp';
import path from 'path';
import { persistJSON } from '../storage';
import {createSprite, ImageSource, Sprite} from 'quick-sprite';

const MAX_WIDTH = 3072;
const TEAM_IMAGE_SIZE = 180;
const TEAM_IMAGE_PADDING = 60; // TEAM_IMAGE_SIZE / 3;
const PLAYER_IMAGE_SIZE = 120;
const PLAYER_IMAGE_TOP_PADDING = 5;

// Note: team and franchise photos are downlaoaded as 125x125 squares
// Since they will be rendered within a circle, add extra padding so that none of the base image is clipped
export const teamTransform = (_key: string, image: Jimp): Jimp => {
  const base = new Jimp(TEAM_IMAGE_SIZE, TEAM_IMAGE_SIZE, '#ffffff');
  const resized = image.resize(TEAM_IMAGE_SIZE - TEAM_IMAGE_PADDING, Jimp.AUTO);

  return base.composite(resized, TEAM_IMAGE_PADDING / 2, TEAM_IMAGE_PADDING / 2);
};

// Note: player images are 120x180 rectangles
// Resize to 90px wide, then add 15px padding to the left and right
// We could leave these larger, but player pictures don't need that much resolution, and this saves space
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
  }).resize(Jimp.AUTO, PLAYER_IMAGE_SIZE);

  return base.composite(resized, (PLAYER_IMAGE_SIZE - resized.getWidth()) / 2, PLAYER_IMAGE_TOP_PADDING);
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
