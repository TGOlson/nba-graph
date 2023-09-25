import Graph, { DirectedGraph } from "graphology";
import { circular } from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";
import Color from "color";

import { NBAData } from "../../shared/nba-types";
import { NodeAttributes, Palette, SeasonToken, SelectionMap, SpriteNodeAttributes } from "../../shared/types";
import { GraphConfig } from "./config";
import { loadSpriteColors, loadSpriteIds, loadSpriteMapping } from "../storage";
import { getProp, notNull, singleYearStr } from "../../shared/util";
import { assets } from "../../shared/assets";
import { uniqBy } from "ramda";

// TODO: things that would be nice to add (that we already have the data for, but need to stitch together):
// - years active for players
// - leagues active for players
// - leagues for teams (and franchises)

// mainly thinking for dropdown search:
// eg.
// [pic] Steph Curry
//       2013-present / NBA
// [pic] Denver Nuggets (franchise)
//       1976-1982 / ABA
// [pic] Denver Nuggets (franchise)
//       1985-present / NBA

const PLAYER_DEFAULT_CROP_ID = 'player_default';
const TEAM_DEFAULT_CROP_ID = 'team_default';

// const DEFAULT_IMAGE_CROP = {x: 0, y: 0, width: 128, height: 128};

const filterYears = (data: NBAData, config: GraphConfig): NBAData => {
  const startYear = config.startYear ?? 0; 
  const endYear = config.endYear ?? Infinity;

  const seasons = data.seasons.filter(({year}) => year >= startYear && year <= endYear);
  const teams = data.teams.filter(({year}) => year >= startYear && year <= endYear);
  const playerSeasons = data.playerSeasons.filter(({year}) => year >= startYear && year <= endYear);
  // const awards = data.awards.filter(({year}) => !year || (year >= startYear && year <= endYear));
  const awardRecipients = data.awardRecipients.filter(({year}) => !year || (year >= startYear && year <= endYear));
  const multiWinnerAwards = data.multiWinnerAwards.filter(({year}) => year >= startYear && year <= endYear);

  return {
    ...data,
    seasons,
    teams,
    playerSeasons,
    // awards,
    awardRecipients,
    multiWinnerAwards,
  };
};

const toMap = <T>(key: (t: T) => string, arr: T[]): {[key: string]: T} => {
  return arr.reduce<{[key: string]: T}>((acc, x) => {
    acc[key(x)] = x;
    return acc;
  }, {});
};

const dedupeSeasonTokens = (seasons: SeasonToken[]): SeasonToken[] => {
  return uniqBy(x => `${x.leagueId}-${x.year}`, seasons);
};

type SpriteDataLookup = {
  spriteId: string;
  imageUrl: string;
  mapping: SelectionMap;
  colors: {[key: string]: Palette};
};

export const buildGraph = async (rawData: NBAData, config: GraphConfig): Promise<Graph> => {
  console.log('Building graph');
  const graph = new DirectedGraph();

  const data = filterYears(rawData, config);
  
  const spriteIds = await loadSpriteIds();

  console.log('Using sprite ids', spriteIds);

  const spriteLookupData: SpriteDataLookup[] = await Promise.all(spriteIds.map(async (spriteId) => {
    const imageUrl = assets.spriteUrl(spriteId);
    const mapping = await loadSpriteMapping(spriteId);
    const colors = await loadSpriteColors(spriteId);

    return {spriteId, imageUrl, mapping, colors};
  }));

  const maybeGetSpriteAttributes = (key: string): {attributes: SpriteNodeAttributes, primaryColor: string} | null => {
    // Find which sprite data contains the given key
    const spriteData = spriteLookupData.find(x => x.mapping[key]);
    if (!spriteData) return null;

    const {spriteId, imageUrl, mapping, colors} = spriteData;

    return {
      attributes: {
        type: spriteId,
        image: imageUrl,
        crop: getProp(key, mapping),
      },
      primaryColor: getProp(key, colors).primary,
    };
  };


  const getSpriteAttributes = (key: string): {attributes: SpriteNodeAttributes, primaryColor: string} => {
    const attrs = maybeGetSpriteAttributes(key);
    if (!attrs) throw new Error(`Unexpected error: no sprite data for ${key}`);

    return attrs;
  };

  const defaultPlayerSpriteAttributes = {
    ...getSpriteAttributes(PLAYER_DEFAULT_CROP_ID),
    primaryColor: config.borderColors.player,
  };
  const defaultTeamSpriteAttributes = {
    ...getSpriteAttributes(TEAM_DEFAULT_CROP_ID),
    primaryColor: config.borderColors.team,
  };

  const seasonsById = toMap(x => x.id, data.seasons);
  const teamsById = toMap(x => x.id, data.teams);
  const awardsById = toMap(x => x.id, data.awards);  
  const multiWinnerAwardsById = toMap(x => x.id, data.multiWinnerAwards);

  const playerSeasons = data.playerSeasons.reduce<{[playerId: string]: SeasonToken[]}>((acc, ps) => {
    const prev = acc[ps.playerId] ?? [];

    const team = teamsById[ps.teamId];
    if (!team) throw new Error(`Unexpected error: no team for player ${ps.playerId} ${ps.year}`);

    const season = seasonsById[team.seasonId];
    if (!season) throw new Error(`Unexpected error: no season for player ${ps.playerId} ${ps.year}`);

    prev.push({
      leagueId: season.leagueId,
      year: season.year,
    });

    acc[ps.playerId] = prev;

    return acc;
  }, {});

  // *************
  // *** NODES ***
  // *************

  data.leagues.forEach(league => {
    const seasons = data.seasons.filter(season => season.leagueId === league.id);
    const yearsAll = seasons.map(season => season.year).sort();
    const years = [...new Set(yearsAll)];

    const seasonTokens = years.map(year => ({leagueId: league.id, year}));

    const spriteAttrs = getSpriteAttributes(league.id);

    const attrs: NodeAttributes = {
      nbaType: 'league',
      label: league.id, 
      url: league.url,
      size: config.sizes.league, 
      seasons: seasonTokens,
      color: config.nodeColors.default, 
      borderColor: spriteAttrs.primaryColor,
      ...spriteAttrs.attributes, 
    };

    graph.addNode(league.id, attrs);
  });

  data.seasons.forEach(season => {
    const spriteAttrs = getSpriteAttributes(season.leagueId);
    const borderColor = spriteAttrs.primaryColor;

    const edgeColor = Color(borderColor).lighten(0.3).hex();

    const attrs: NodeAttributes = {
      nbaType: 'season',
      name: `${season.leagueId} Season`,
      label: `${singleYearStr(season.year)} ${season.leagueId} Season`, 
      url: season.url,
      rollupId: season.leagueId,
      seasons: [{leagueId: season.leagueId, year: season.year}],
      color: config.nodeColors.default, 
      size: config.sizes.season, 
      borderColor,
      ...spriteAttrs.attributes, 
    };

    graph.addNode(season.id, attrs);
    graph.addEdge(season.leagueId, season.id, {color: edgeColor, hidden: true});
  });

  data.players.forEach(player => {
    // TODO: more sophisticated size calculation, using seasons, awards, etc.
    const seasonsAll = playerSeasons[player.id];
    if (!seasonsAll) throw new Error(`Unexpected error: no years active for player ${player.name}`);
    const seasons = dedupeSeasonTokens(seasonsAll).sort((a, b) => a.year - b.year);

    const yearsAll = seasons.map(x => x.year).sort();
    const years = [...new Set(yearsAll)];
    const end = years[years.length - 1];

    const size = (years.length <= 3 && end !== 2023) ? config.sizes.playerMin : config.sizes.playerDefault;

    const imgProps = (maybeGetSpriteAttributes(player.id) ?? defaultPlayerSpriteAttributes).attributes;

    const attrs: NodeAttributes = {
      nbaType: 'player',
      label: player.name, 
      url: player.url,
      seasons,
      size, 
      color: config.nodeColors.default, 
      borderColor: config.borderColors.player,
      ...imgProps, 
    };

    graph.addNode(player.id, attrs);
  });
  
  data.franchises.forEach(franchise => {
    const spriteAttrs = maybeGetSpriteAttributes(franchise.id) ?? defaultTeamSpriteAttributes;
    
    const franchiseTeams = data.teams.filter(team => team.franchiseId === franchise.id);
    const seasons = franchiseTeams.map(team => seasonsById[team.seasonId]).filter(notNull);
    const seasonTokens = seasons.map(season => ({leagueId: season.leagueId, year: season.year})).sort((a, b) => a.year - b.year);

    const attrs: NodeAttributes = { 
      nbaType: 'franchise',
      label: franchise.name, 
      url: franchise.url,
      seasons: seasonTokens,
      size: config.sizes.franchise, 
      color: config.nodeColors.default, 
      borderColor: spriteAttrs.primaryColor,
      ...spriteAttrs.attributes, 
    };

    graph.addNode(franchise.id, attrs);
  });


  data.teams.forEach(team => {
    const label = `${team.name} (${singleYearStr(team.year)})`;

    const spriteAttrs = maybeGetSpriteAttributes(team.id) ?? maybeGetSpriteAttributes(team.franchiseId) ?? defaultTeamSpriteAttributes;
    
    const leagueId = seasonsById[team.seasonId]?.leagueId;
    if (!leagueId) throw new Error(`Unexpected error: no leagueId for team ${team.name} ${team.year}`);
    
    const borderColor = spriteAttrs.primaryColor;
    const leagueColor = getSpriteAttributes(leagueId).primaryColor;
    
    const teamEdgeColor = borderColor === config.borderColors.team ? config.edgeColors.default : Color(borderColor).lighten(0.3).hex();
    const seasonEdgeColor = Color(leagueColor).lighten(0.3).hex();

    const attrs: NodeAttributes = { 
      nbaType: 'team',
      name: team.name,
      label, 
      url: team.url,
      rollupId: team.franchiseId,
      seasons: [{leagueId, year: team.year}],
      size: config.sizes.team, 
      color: config.nodeColors.default, 
      borderColor,
      ...spriteAttrs.attributes,
    };

    graph.addNode(team.id, attrs);
    graph.addEdge(team.id, team.seasonId, {color: seasonEdgeColor, hidden: true});
    graph.addEdge(team.id, team.franchiseId, {color: teamEdgeColor, hidden: true});
  });

  data.awards.forEach(award => {
    const multiWinner = data.multiWinnerAwards.filter(x => x.awardId === award.id);
    const recipients = data.awardRecipients.filter(x => x.awardId === award.id);

    const potentialYearsAll = [...multiWinner, ...recipients].map(x => x.year).filter(notNull).sort();
    const years = [...new Set(potentialYearsAll)];

    let seasons = years.map(year => ({leagueId: award.leagueId, year}));
    
    // this will be the case for lifetime awards that don't have years
    // in this case just use the cumulative career years of all the recipients
    if (seasons.length === 0) {
      const recipientSeasons = recipients.map(x => playerSeasons[x.recipientId]).flat().filter(notNull);
      seasons = dedupeSeasonTokens(recipientSeasons).sort((a, b) => a.year - b.year);
    }

    const spriteAttrs = getSpriteAttributes(award.image.id);

    const attrs: NodeAttributes = {
      nbaType: 'award',
      name: award.name,
      label: award.name,
      url: award.url,
      seasons,
      color: config.nodeColors.default,
      size: config.sizes.awardMax, // TODO: maybe filter by mvp, hof for max, others are default size?
      borderColor: spriteAttrs.primaryColor,
      ...spriteAttrs.attributes,
    };

    graph.addNode(award.id, attrs);
  });

  data.multiWinnerAwards.forEach(award => {
    const baseAward = awardsById[award.awardId];
    if (!baseAward) throw new Error(`Unexpected error: no base award for multi-winner award ${award.name}`);

    const spriteAttrs = getSpriteAttributes(award.image.id);

    const borderColor = spriteAttrs.primaryColor;
    const edgeColor = Color(borderColor).lighten(0.3).hex();

    const label = award.name.includes('All-Star') ? `${award.name} (${award.year})` : `${award.name} (${singleYearStr(award.year)})`;

    const attrs: NodeAttributes = {
      nbaType: 'multi-winner-award',
      name: award.name,
      label: label,
      url: award.url,
      rollupId: baseAward.id,
      seasons: [{leagueId: baseAward.leagueId, year: award.year}],
      color: config.nodeColors.default,
      size: config.sizes.awardDefault,
      borderColor,
      ...spriteAttrs.attributes,
    };
    
    graph.addNode(award.id, attrs);
    graph.addEdge(award.awardId, award.id, {color: edgeColor, hidden: true});
  });

  // *************
  // *** EDGES ***
  // *************

  data.playerSeasons.forEach(pt => {
    const teamPrimary = maybeGetSpriteAttributes(pt.teamId)?.primaryColor;
  
    const color = teamPrimary
      ? Color(teamPrimary).lighten(0.3).hex()
      : config.edgeColors.default;

    graph.addEdge(pt.playerId, pt.teamId, {color, hidden: true});
  });

  data.awardRecipients.forEach(recipient => {
    // Need to check for dupdes because of how the data is modeled for single-winner awards
    // eg. for MVP winners we just make an edge between player->NBA>MVP, without distinguishing between the years
    // for guys who have won an MVP multiple times, this would create a duplicate edge
    // in the future maybe it would be nice to add a weight to the edge to distinguish between multiple wins
    // (or add an edge label, but that isn't used elsewhere and I think would be too busy)
    if (!graph.hasEdge(recipient.recipientId, recipient.awardId)) {
      const award = awardsById[recipient.awardId] ?? multiWinnerAwardsById[recipient.awardId];
      if (!award) throw new Error(`Unexpected error: no award for recipient ${recipient.recipientId} ${recipient.awardId}`);

      const borderColor = getSpriteAttributes(award.image.id).primaryColor;      
      const edgeColor = Color(borderColor).lighten(0.3).hex();

      graph.addEdge(recipient.recipientId, recipient.awardId, {color: edgeColor, hidden: true, year: recipient.year, nbaType: 'award'});
    }
  });

  console.log('Assigning locations');
  circular.assign(graph);

  // This call takes a little while...
  const settings = forceAtlas2.inferSettings(graph);
  console.log('infered settings', forceAtlas2.inferSettings(graph));
  // => 
  // const settings = {
  //   barnesHutOptimize: true,
  //   strongGravityMode: true,
  //   gravity: 0.05,
  //   scalingRatio: 10,
  //   slowDown: 9.031385330625534
  // };


  forceAtlas2.assign(graph, {
    iterations: 100,
    settings,
  });

  console.log('Done!');
  return graph;
};
