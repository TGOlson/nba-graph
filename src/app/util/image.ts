import { parse } from 'url';
import { Coordinates } from "../../shared/types";

export type Sprite = {offsets: {[key: string]: Coordinates}, img: ImageData};

export const fetchImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };

    img.onerror = (err) => {
      reject(err);
    };

    img.src = url;
  });
};

// Note: this is used as a key for the combined images (actually, combined sprites)
// Effectively we end up combining multiple sprites into a mega-sprite and use a per-key offset
// to narrow down into sub-sprites
// This biggest trick here is that this key needs to match the 'image' attribute in the graph nodes data
const imageKey = (image: HTMLImageElement): string => {
  const path = parse(image.src).pathname;
  if (!path) throw new Error(`Unable to parse image key for ${image.src}`);

  return path;
};

export const combineImages = (images: HTMLImageElement[]): Sprite => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', {willReadFrequently: true}) as CanvasRenderingContext2D;

  const width = Math.max(...images.map(x => x.width));
  const height = images.reduce((acc, x) => acc + x.height, 0);
  canvas.width = width;
  canvas.height = height;

  let yOffset = 0;

  const offsets: {[key: string]: Coordinates} = {};

  images.forEach(img => {
    ctx.drawImage(img, 0, yOffset);

    const key = imageKey(img);
    offsets[key] = {x: 0, y: yOffset};
  
    yOffset += img.height;
  });

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);

  return {offsets, img};
};
