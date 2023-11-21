import path from "path";
import { readdir } from "fs/promises";
import Jimp from "jimp";

import { loadSpriteIds, persistJSON } from "../storage";
import { imageDir, imgPath, spriteColorsPath, spriteMappingPath, spritePath } from "../storage/paths";
import { createSpriteImage, parseSpriteColorPallette, playerTransform, teamTransform } from "../util/image";
import { execSeq } from "../util/promise";

export const convertImages = async () => {
  const readDirPaths = (dir: string): Promise<string[]> => {
    return readdir(dir).then(filenames => filenames.map(filename => path.resolve(dir, filename)));
  };

  const playerPaths = await readDirPaths(imageDir('player'));
  const n = playerPaths.length;
  const playerPaths0 = playerPaths.slice(0, n / 2);
  const playerPaths1 = playerPaths.slice(n / 2, n);

  const otherPaths = (await Promise.all([
    readDirPaths(imageDir('team')),
    readDirPaths(imageDir('franchise')),
    readDirPaths(imageDir('award')),
    readDirPaths(imageDir('league')),
    [
      imgPath(null, 'player_default', 'png'),
      imgPath(null, 'team_default', 'png'),
    ]
  ])).flat();
  
  const otherTransform = (key: string, image: Jimp): Jimp => {
    // Super hacky, but doesn't feel worth it to refactor transform scheme now...
    // Basically use team transform for all 3 letter keys (with or without trailing years) that aren't NBA, ABA, or BAA
    // We want to apploy this to all team and franchise images, and nothing else...
    return key.match(/(?!NBA|ABA|BAA)[A-Z]{3}/) ? teamTransform(key, image) : image;
  };

  return Promise.all([
    {paths: playerPaths0, transform: playerTransform, dedupe: false},
    {paths: playerPaths1, transform: playerTransform, dedupe: false},
    {paths: otherPaths, transform: otherTransform, dedupe: true},
  ].map(({paths, transform, dedupe}, index) => {
    const key = `sprite_${index}`;
    return createSpriteImage(paths, spritePath(key), spriteMappingPath(key), transform, dedupe);
  }));
};

export const parsePrimaryColors = async () => {
  const spriteIds = await loadSpriteIds();

  return execSeq(spriteIds.map(spriteId => async () => {
    const colors = await parseSpriteColorPallette(spriteId);
    return persistJSON(spriteColorsPath(spriteId))(colors);
  }));
};
