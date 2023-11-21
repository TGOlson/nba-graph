import * as Download from "../storage/download";

import { validAllStarSeasons } from "../parsers/awards/all-star";
import { franchiseParser } from "../parsers/franchise";
import { runHtmlParser } from "../parsers/html-parser";
import { makePlayerParser } from "../parsers/player";

import { loadFranchises, loadPlayers, loadTeams } from "../storage";
import { LEAGUE_CHAMP_URL, allStarUrl, awardUrls } from "../util/bref-url";
import { Fetch } from "../util/fetch";
import { execSeq } from "../util/promise";
import { azLowercase } from "./util";

export const downloadLeagueIndex = (fetch: Fetch) => Download.downloadLeagueIndex(fetch);
export const downloadTeamIndex = (fetch: Fetch) => Download.downloadTeamIndex(fetch);
export const downloadTeam = (fetch: Fetch, franchiseId: string) => Download.downloadTeam(fetch, franchiseId);

export const downloadTeamAll = async (delayedFetch: Fetch) => {
  const franchises = await runHtmlParser(franchiseParser);

  return execSeq(franchises.map(franchise => {
    return () => downloadTeam(delayedFetch, franchise.id);
  }));  
};

export const downloadPlayerIndex = (fetch: Fetch, firstLetterLastName: string) => Download.downloadPlayerIndex(fetch, firstLetterLastName);
export const downloadPlayerIndexAll = async (delayedFetch: Fetch) => {
  return execSeq(azLowercase.map(x => {
    return () => downloadPlayerIndex(delayedFetch, x);
  }));
};

export const downloadPlayer = (fetch: Fetch, playerId: string) => Download.downloadPlayer(fetch, playerId);

export const downloadPlayerGroup = async (delayedFetch: Fetch, letter: string) => {
  const players = await runHtmlParser(makePlayerParser(letter));
  const playerIds = players.map(x => x.id);

  return execSeq(playerIds.map(id => {
    return () => downloadPlayer(delayedFetch, id);
  }));
};

export const downloadPlayerAll = async (delayedFetch: Fetch, targetYear?: number) => {
  const players = await Promise.all(
    azLowercase.map(x => runHtmlParser(makePlayerParser(x)))
  ).then(x => x.flat());

  const playerIds = players.filter(({yearMax}) => targetYear ? yearMax === targetYear : true).map(x => x.id);

  return execSeq(playerIds.map(id => {
    return () => downloadPlayer(delayedFetch, id);
  }));
};

export const downloadFranchiseImages = async (fetch: Fetch) => {
  const franchises = await loadFranchises();

  const fns = franchises.map(x => {
      return () => Download.downloadImage(fetch, x.image, 'franchise', x.id)
        .catch(err => console.log('Error downloading image... skipping... ', x.id, err));
  });

  return await execSeq(fns);
};

export const downloadTeamImages = async (fetch: Fetch, targetYear?: number) => {
  const teamsAll  = await loadTeams();
  const teams = targetYear ? teamsAll.filter(x => x.year === targetYear) : teamsAll;

  const fns = teams.map(x => {
      return () => Download.downloadImage(fetch, x.image, 'team', x.id)
        .catch(err => console.log('Error download image for. Skipping ', x.id, err));
  });

  return await execSeq(fns);
};

export const downloadPlayerImages = async (fetch: Fetch, targetYear?: number) => {
  const playersAll = await loadPlayers();
  const players = targetYear ? playersAll.filter(x => x.yearMax === targetYear) : playersAll;

  const startAt = 0; // TODO: add back?
  // const startAt = startAtId ? players.findIndex(x => x.id == startAtId) : 0;

  const fns = players.slice(startAt, players.length).map((x, i) => {
      return async () => {
        console.log(`[${i + startAt} of ${players.length}]: Fetching image for: ${x.id}`);

        if (!x.image) {
          console.log('No image found for player, skipping...', x.id);
          return;
        }

        return await Download.downloadImage(fetch, x.image, 'player', x.id);
      };
  });

  return await execSeq(fns);
};

export const downloadAwards = async (delayedFetch: Fetch) => {
  const urls = [
    ...Object.values(awardUrls),
    LEAGUE_CHAMP_URL,
  ];
  
  return await execSeq(urls.map(url => {
    return () => Download.downloadPage(delayedFetch, url);
  }));
};

export const downloadAllStar = async (delayedFetch: Fetch) => {
  const allStarUrls = validAllStarSeasons.map(allStarUrl);

  return await execSeq(allStarUrls.map(url => {
    return () => Download.downloadPage(delayedFetch, url);
  }));
};
