import { readdir } from 'fs/promises';
import Jimp from 'jimp';
import path from 'path';
import { persistJSON } from '../storage';
import {createSprite, ImageSource, Sprite} from 'quick-sprite';

const DEFAULT_QUALITY = 30;
const MAX_WIDTH = 3072;
const DEFAULT_SIZE = 180;

export async function convertToBW(inputPath: string, outputPath: string): Promise<void> {
  const image = await Jimp.read(inputPath);

  image
    .quality(DEFAULT_QUALITY)
    .greyscale()
    .opacity(0.3)
    .background(0xFAFAFA)
    .write(outputPath);
}

export async function createSpriteImage(inputDir: string, imagePath: string, mappingPath: string, dedupe?: boolean): Promise<void> {
  const fileNames: string[] = await readdir(inputDir);
  const sources: ImageSource[] = fileNames.map(f => {
    const key = f.split('.')[0];
    if (!key) throw new Error(`Unable to parse key for: ${f}`);

    return {key, path: path.resolve(inputDir, f)};
  });

  const transform = (_key: string, image: Jimp): Jimp => {
    // Images will be rendered within circle on the resulting graph, so resize and crop to constant dimension

    // make a new 90x90 image with white background
    const newImage = new Jimp(DEFAULT_SIZE, DEFAULT_SIZE, '#ffffff');

    const croppedImage = image
      .resize(DEFAULT_SIZE - 60, Jimp.AUTO)
      .crop(0, 0, DEFAULT_SIZE - 60, DEFAULT_SIZE - 60);

    return newImage.composite(croppedImage, 30, 30);
  };

  const {image, mapping}: Sprite = await createSprite(sources, {
    fillMode: 'row',
    maxWidth: MAX_WIDTH,
    dedupe: dedupe,
    transform,
    debug: true,
  });

  await image.writeAsync(imagePath);

  await persistJSON(mappingPath)(mapping);
}
