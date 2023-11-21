import { runHtmlParser } from "../parsers/html-parser";
import { franchiseParser } from "../parsers/franchise";
import { leagueParser } from "../parsers/league";
import { makePlayerParser } from "../parsers/player";
import { seasonParser } from "../parsers/season";
import { makeTeamParser } from "../parsers/team";
import { makePlayerSeasonParser } from "../parsers/player-season";
import { runAwardsParsers } from "../parsers/awards";

import * as storage from "../storage";
import { azLowercase } from "./util";

export const parseLeagues = async () => runHtmlParser(leagueParser).then(storage.persistLeagues);
export const parseSeasons = async () => runHtmlParser(seasonParser).then(storage.persistSeasons);
export const parseFranchises = async () => runHtmlParser(franchiseParser).then(storage.persistFranchises);
export const parseTeams = async () => {
  const franchises = await runHtmlParser(franchiseParser);
  const franchiseIds = franchises.map(x => x.id);

  const teams = await Promise.all(
    franchiseIds.map(id => runHtmlParser(makeTeamParser(id)))
  ).then(xs => xs.flat());
  
  return await storage.persistTeams(teams);
};

export const parsePlayers = async () => {
  const partialPlayers = await Promise.all(
    azLowercase.map(x => runHtmlParser(makePlayerParser(x)))
  ).then(xs => xs.flat());

  const res = await Promise.all(
    partialPlayers.map(player => runHtmlParser(makePlayerSeasonParser(player)))
  );

  const players = res.map(x => x.player);
  const playerSeasons = res.map(x => x.seasons).flat();

  await storage.persistPlayers(players);
  return await storage.persistPlayerSeasons(playerSeasons);
};

export const parseAwards = async () => {
  const {awards, multiWinnerAwards, awardRecipients} = await runAwardsParsers();

  await storage.persistAwards(awards);
  await storage.persistMultiWinnerAwards(multiWinnerAwards);
  return await storage.persistAwardRecipients(awardRecipients);
};
