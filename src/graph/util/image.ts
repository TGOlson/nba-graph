import { readdir } from 'fs/promises';
import Jimp from 'jimp/es';
import path from 'path';
import { persistJSON } from '../storage';

// TODO: this doesn't seem to do anything
// another way would be to reduce image size to maybe 75x75 for each (125x125 currently, not needed to be so big)
const DEFAULT_QUALITY = 30;

export async function convertToBW(inputPath: string, outputPath: string): Promise<void> {
  const image = await Jimp.read(inputPath);

  image
    .quality(DEFAULT_QUALITY)
    .greyscale()
    .opacity(0.3)
    .background(0xFAFAFA)
    .write(outputPath);
}

type Spec = {
  key: string,
  img: Jimp,
  x: number,
  y: number,
};

// TODO: potential fun logo optimization
// if a logo is the exact same as a prior year, don't add it to the spite (altho keep it in the mapping)

// things to test

// * dedupe

const MAX_WIDTH = 3072;
const DEFUALT_SIZE = 75;

export async function createSpriteImage(inputDir: string, imagePath: string, mappingPath: string): Promise<void> {
  const fileNames: string[] = await readdir(inputDir);
  const filePaths: {key: string, path: string}[] = fileNames.map(f => {
    const key = f.split('.')[0];
    if (!key) throw new Error(`Unable to parse key for: ${f}`);

    return {key, path: path.resolve(inputDir, f)};
  });
  
  const images: {key: string, img: Jimp}[] = await Promise.all(filePaths.map(x => {
    return Jimp.read(x.path).then(img => ({key: x.key, img }));
  }));

  const specs: Spec[] = [];
  let offsetY = 0;
  let offsetX = 0;

  images.forEach(({img, key}, i) => {
    // Images will be rendered within circle on the resulting graph
    // Could be a little fancier here to deal with non-square images, but this works for now
    img.resize(DEFUALT_SIZE, Jimp.AUTO);
    img.crop(0, 0, DEFUALT_SIZE, DEFUALT_SIZE);

    const width = img.getWidth();
    const height = img.getHeight();

    const prevImg = specs[i - 1]?.img ?? new Jimp(1, 1);
    const diff = Jimp.diff(img, prevImg);

    // Use previous spec if images are identical, saves a lot of spec for team logos that only change every few years
    if (i > 0 && diff.percent === 0) {
      const prevSpec = specs[i - 1] as {key: string, img: Jimp, x: number, y: number};
      const spec = {...prevSpec, key};
      specs.push(spec);
      return;
    }

    if (offsetX + width > MAX_WIDTH) {
      offsetX = 0;
      offsetY += height; // assumes all images are the same size, which is currently true due to resize above
    }

    specs.push({
      key,
      img,
      x: offsetX,
      y: offsetY
    });

    offsetX += width;
  });

  const width = Math.max(...specs.map(({x, img}) => x + img.getWidth()));
  const height = Math.max(...specs.map(({y, img}) => y + img.getHeight()));

  const image = new Jimp(width, height, 0x00000000).quality(DEFAULT_QUALITY);

  specs.forEach(spec => {
    image.composite(spec.img, spec.x, spec.y);
  });

  await image.writeAsync(imagePath);

  const mapping = specs.reduce((map, {key, x, y, img}) => {
    return {...map, [key]: {x, y, width: img.getWidth(), height: img.getHeight()}};
  }, {});
  
  await persistJSON(mappingPath)(mapping);
}
