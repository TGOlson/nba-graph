import { Award, AwardRecipient, SeasonAward } from "../../../shared/nba-types";
import { runHtmlParser } from "../html-parser";
import { ALL_STAR_AWARDS, allStarParser } from "./all-star";
import { leagueChampAwardsParser } from "./league-champ";
import { lifetimeAwardParser } from "./lifetime-awards";
import { seasonAwardsParser } from "./season-award";

export type AwardParseResult = {
  awards: Award[],
  seasonAwards: SeasonAward[],
  awardRecipients: AwardRecipient[],
};

export async function runAwardsParsers(): Promise<AwardParseResult> {
  const seasonAwardsRes = await Promise.all(
    seasonAwardsParser.map(parser => runHtmlParser(parser))
  );

  const allStarAwardRes = await Promise.all(
    allStarParser.map(parser => runHtmlParser(parser))
  );

  const leagueChampAwardRes = await runHtmlParser(leagueChampAwardsParser);

  const lifetimeAwardsRes = await Promise.all(
    lifetimeAwardParser.map(parser => runHtmlParser(parser))
  );

  const awards = [
    ...seasonAwardsRes.flatMap(x => x.awards),
    ...ALL_STAR_AWARDS,
    ...leagueChampAwardRes.awards,
    ...lifetimeAwardsRes.map(x => x.award),
  ];
  const seasonAwards = [
    ...seasonAwardsRes.flatMap(x => x.seasonAwards),
    ...allStarAwardRes.map(x => x.seasonAward)
  ];

  const awardRecipients = [
    ...seasonAwardsRes.flatMap(x => x.awardRecipients),
    ...allStarAwardRes.flatMap(x => x.awardRecipients),
    ...leagueChampAwardRes.awardRecipients,
    ...lifetimeAwardsRes.flatMap(x => x.awardRecipients),
  ];

  return {
    awards,
    seasonAwards,
    awardRecipients,
  };
}
