import { readdir } from 'fs/promises';
import Jimp from 'jimp/es';
import path from 'path';
import { persistJSON } from '../storage';

export type LocationMapping = {
  [key: string]: {x: number, y: number, width: number, height: number}
};

export async function convertToBW(inputPath: string, outputPath: string): Promise<void> {
  const image = await Jimp.read(inputPath);

  image
    .greyscale()
    .opacity(0.5)
    .background(0xE2E2E2)
    .write(outputPath);
}

type Spec = {
  key: string,
  img: Jimp,
  x: number,
  y: number,
};

export async function createSpriteImage(inputDir: string, imagePath: string, mappingPath: string): Promise<void> {
  const fileNames: string[] = await readdir(inputDir);
  const filePaths: {key: string, path: string}[] = fileNames.map(f => {
    const key = f.split('.')[0];
    if (!key) throw new Error(`Unable to parse key for: ${f}`);

    return {key, path: path.resolve(inputDir, f)};
  });
  
  const images: {key: string, img: Jimp}[] = await Promise.all(filePaths.map(x => {
    return Jimp.read(x.path).then(img => ({key: x.key, img}));
  }));

  const specs: Spec[] = [];
  let offsetY = 0;

  images.forEach(({img, key}) => {
    specs.push({
      key,
      img,
      x: 0,
      y: offsetY
    });

    offsetY += img.getHeight();
  });

  const width = Math.max(...images.map(({img}) => img.getWidth()));
  const height = images.reduce((acc, {img}) => acc + img.getHeight(), 0);

  const image = new Jimp(width, height, 0x00000000);

  specs.forEach(spec => {
    image.composite(spec.img, spec.x, spec.y);
  });

  await image.writeAsync(imagePath);

  const mapping = specs.reduce((map, {key, x, y, img}) => {
    return {...map, [key]: {x, y, width: img.getWidth(), height: img.getHeight()}};
  }, {});
  
  await persistJSON(mappingPath)(mapping);
}
