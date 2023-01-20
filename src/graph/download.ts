import * as cheerio from 'cheerio';
import { mkdir, writeFile } from 'fs/promises';
import { persistImage } from './storage';

import { ImageUrl, LEAGUES_URL, localPath, playerIndexUrl, playerUrl, TEAMS_URL, teamUrl } from './util/bref-url';
import { Fetch } from './util/fetch';

async function downloadPage(fetch: Fetch, url: string): Promise<void> {
  console.log('Downloading url: ', url);
  const response = await fetch(url);
  const body = await response.text();
  
  const $ = cheerio.load(body);
  const html = $('body').html();

  if (!html) throw new Error(`Unexpected response from ${url}: ${response.status}, ${response.statusText}`);

  const {dirPath, filePath} = localPath(url);

  console.log('Saving file to:', filePath);

  await mkdir(dirPath, { recursive: true });
  return await writeFile(filePath, html);
}

export async function downloadLeagueIndex(fetch: Fetch): Promise<void> {
  return downloadPage(fetch, LEAGUES_URL);
}

export async function downloadTeamIndex(fetch: Fetch): Promise<void> {
  return downloadPage(fetch, TEAMS_URL);
}

export async function downloadTeam(fetch: Fetch, franchiseId: string): Promise<void> {
  return downloadPage(fetch, teamUrl(franchiseId));
}

export async function downloadPlayerIndex(fetch: Fetch, firstLetterLastName: string): Promise<void> {
  return downloadPage(fetch, playerIndexUrl(firstLetterLastName));
}

export async function downloadPlayer(fetch: Fetch, playerId: string): Promise<void> {
  return downloadPage(fetch, playerUrl(playerId));
}

// *** Note for image downloads:
//   This is a pretty big hack that uses an expected URL pattern this is likely to change over time
//   However, it is much easier than re-parsing each file (especially in the case of players, which takes a long time)
//   This works fine for now (eg. running on Jan 5 2023), but will likely break in the future
//
// TODO: update this to parse urls from downloaded files instead of relying on URL pattern

export async function downloadImage(fetch: Fetch, imageUrl: ImageUrl, namespace: string, id: string): Promise<void> {
  const res = await fetch(imageUrl.url).catch((err) => {
    console.log('Error fetching url, trying fallback: ', imageUrl.url, err);
    return fetch(imageUrl.fallback);
  });

  const body = await res.arrayBuffer();
  const img = Buffer.from(body);

  return await persistImage(namespace, id, img);
}
