import { readdir } from 'fs/promises';
import Jimp from 'jimp';
import path from 'path';
import { persistJSON } from '../storage';
import {createSprite, ImageSource, Sprite} from 'quick-sprite';

const MAX_WIDTH = 3072;
const TEAM_IMAGE_SIZE = 180;
const TEAM_PADDING = 60; // default size / 3
const PLAYER_IMAGE_SIZE = 100;

// Note ***
// Team and franchise photos are 120x120 squares.
// Since they will be rendered within a circle, add extra padding so that none of the base image is clipped
export const teamTransform = (_key: string, image: Jimp): Jimp => {
  // Images will be rendered within circle on the resulting graph, so resize and crop to constant dimension
  // make a new larger image with white background
  const newImage = new Jimp(TEAM_IMAGE_SIZE, TEAM_IMAGE_SIZE, '#ffffff');

  const croppedImage = image
    .resize(TEAM_IMAGE_SIZE - TEAM_PADDING, Jimp.AUTO)
    .crop(0, 0, TEAM_IMAGE_SIZE - TEAM_PADDING, TEAM_IMAGE_SIZE - TEAM_PADDING);

  return newImage.composite(croppedImage, TEAM_PADDING / 2, TEAM_PADDING / 2);
};

// Note ***
// Player images are 120x180 rectangles
// Resize to 100px wide, then crop top 100x100 square
// TODO: should try to any whitespace from top of image to better center faces
export const playerTransform = (_key: string, image: Jimp): Jimp => {
  return image
  .resize(PLAYER_IMAGE_SIZE, Jimp.AUTO)
  .crop(0, 0, PLAYER_IMAGE_SIZE, PLAYER_IMAGE_SIZE);
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
    dedupe: {diffPercent: 0.01},
    transform,
    debug: true,
  });

  await image.writeAsync(imagePath);

  await persistJSON(mappingPath)(mapping);
}
