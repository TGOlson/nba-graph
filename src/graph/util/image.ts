import { readdir } from 'fs/promises';
import Jimp from 'jimp/es';
import path from 'path';
import { persistJSON } from '../storage';
import {createSprite, ImageSource, Sprite} from 'quick-sprite';

// TODO: this doesn't seem to do anything
// another way would be to reduce image size to maybe 75x75 for each (125x125 currently, not needed to be so big)
const DEFAULT_QUALITY = 30;
const MAX_WIDTH = 3072;
const DEFUALT_SIZE = 75;

export async function convertToBW(inputPath: string, outputPath: string): Promise<void> {
  const image = await Jimp.read(inputPath);

  image
    .quality(DEFAULT_QUALITY)
    .greyscale()
    .opacity(0.3)
    .background(0xFAFAFA)
    .write(outputPath);
}

export async function createSpriteImage(inputDir: string, imagePath: string, mappingPath: string): Promise<void> {
  const fileNames: string[] = await readdir(inputDir);
  const sources: ImageSource[] = fileNames.map(f => {
    const key = f.split('.')[0];
    if (!key) throw new Error(`Unable to parse key for: ${f}`);

    return {key, path: path.resolve(inputDir, f)};
  });

  const transform = (_key: string, image: Jimp): Jimp => {
    // Images will be rendered within circle on the resulting graph, so resize and crop to constant dimension
    return image
      .resize(DEFUALT_SIZE, Jimp.AUTO)
      .crop(0, 0, DEFUALT_SIZE, DEFUALT_SIZE);
  };

  const {image, mapping}: Sprite = await createSprite(sources, {
    fillMode: 'row',
    maxWidth: MAX_WIDTH,
    dedupe: true,
    transform,
  });

  await image.writeAsync(imagePath);

  await persistJSON(mappingPath)(mapping);
}
