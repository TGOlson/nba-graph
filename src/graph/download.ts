import * as cheerio from 'cheerio';
import { mkdir, writeFile } from 'fs/promises';

import { LEAGUES_URL, localPath, playerIndexUrl, playerUrl, TEAMS_URL, teamUrl } from './util/bref-url';
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
