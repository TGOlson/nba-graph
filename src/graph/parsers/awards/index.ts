import { Award, AwardRecipient, MultiWinnerAward } from "../../../shared/nba-types";
import { runHtmlParser } from "../html-parser";
import { ALL_STAR_AWARDS, allStarParser } from "./all-star";
import { leagueChampAwardsParser } from "./league-champ";
import { lifetimeAwardParser } from "./lifetime-award";
import { seasonMultiWinnerAwardsParser } from "./season-multi-winner-award";
import { seasonSingleWinnerAwardsParser } from "./season-single-winner-award";

export type AwardParseResult = {
  awards: Award[],
  multiWinnerAwards: MultiWinnerAward[],
  awardRecipients: AwardRecipient[],
};

export async function runAwardsParsers(): Promise<AwardParseResult> {
  const singleWinnerAwardsRes = await Promise.all(
    seasonSingleWinnerAwardsParser.map(parser => runHtmlParser(parser))
  );

  const multiWinnerAwardsRes = await Promise.all(
    seasonMultiWinnerAwardsParser.map(parser => runHtmlParser(parser))
  );

  const allStarAwardRes = await Promise.all(
    allStarParser.map(parser => runHtmlParser(parser))
  );

  const leagueChampAwardRes = await runHtmlParser(leagueChampAwardsParser);

  const lifetimeAwardsRes = await Promise.all(
    lifetimeAwardParser.map(parser => runHtmlParser(parser))
  );

  const awards = [
    ...singleWinnerAwardsRes.flatMap(x => x.awards),
    ...multiWinnerAwardsRes.flatMap(x => x.awards),
    ...ALL_STAR_AWARDS,
    ...leagueChampAwardRes.awards,
    ...lifetimeAwardsRes.map(x => x.award),
  ];
  const multiWinnerAwards = [
    ...multiWinnerAwardsRes.flatMap(x => x.multiWinnerAwards),
    ...allStarAwardRes.map(x => x.mutliWinnerAward)
  ];
  const awardRecipients = [
    ...singleWinnerAwardsRes.flatMap(x => x.awardRecipients),
    ...multiWinnerAwardsRes.flatMap(x => x.awardRecipients),
    ...allStarAwardRes.flatMap(x => x.awardRecipients),
    ...leagueChampAwardRes.awardRecipients,
    ...lifetimeAwardsRes.flatMap(x => x.awardRecipients),
  ];

  return {
    awards,
    multiWinnerAwards,
    awardRecipients,
  };
}
