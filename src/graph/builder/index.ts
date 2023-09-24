import Graph, { DirectedGraph } from "graphology";
import { circular } from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";
import Color from "color";

import { NBAData } from "../../shared/nba-types";
import { NodeAttributes, SeasonToken, SpriteNodeAttributes } from "../../shared/types";
import { assets } from "../../shared/assets";
import { GraphConfig } from "./config";
import { loadSpriteColors, loadSpriteMapping } from "../storage";
import { getProp, notNull, singleYearStr } from "../../shared/util";

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
  const seen = new Set<string>();
  const deduped: SeasonToken[] = [];

  seasons.forEach(season => {
    const key = `${season.leagueId}-${season.year}`;
    if (!seen.has(key)) {
      deduped.push(season);
      seen.add(key);
    }
  });

  return deduped;
};

export const buildGraph = async (rawData: NBAData, config: GraphConfig): Promise<Graph> => {
  console.log('Building graph');
  const graph = new DirectedGraph();

  const data = filterYears(rawData, config);
  
  const playerImgLocations = await loadSpriteMapping('player');
  const teamImgLocations = await loadSpriteMapping('team');
  const franchiseImgLocations = await loadSpriteMapping('franchise');
  const leagueImgLocations = await loadSpriteMapping('league');
  const awardImgLocations = await loadSpriteMapping('award');

  const teamColors = await loadSpriteColors('team');
  const franchiseColors = await loadSpriteColors('franchise');
  const leagueColors = await loadSpriteColors('league');
  const awardColors = await loadSpriteColors('award');

  const seasonsById = toMap(x => x.id, data.seasons);
  const teamsById = toMap(x => x.id, data.teams);
  const awardsById = toMap(x => x.id, data.awards);  
  const multiWinnerAwardsById = toMap(x => x.id, data.multiWinnerAwards);

  const defaultPlayerImage: SpriteNodeAttributes = {
    type: 'sprite',
    image: assets.img.playerSprite,
    crop: getProp(PLAYER_DEFAULT_CROP_ID, playerImgLocations),
  };

  const defaultTeamImage: SpriteNodeAttributes = {
    type: 'sprite',
    image: assets.img.teamSprite,
    crop: getProp(TEAM_DEFAULT_CROP_ID, teamImgLocations),
  };

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
    const imgCoords = leagueImgLocations[league.id];
    if (!imgCoords) throw new Error(`Unexpected error: no image for league ${league.id}`);

    const borderColor = leagueColors[league.id]?.primary;
    if (!borderColor) throw new Error(`Unexpected error: no color for league ${league.id}`);

    const seasons = data.seasons.filter(season => season.leagueId === league.id);
    const yearsAll = seasons.map(season => season.year).sort();
    const years = [...new Set(yearsAll)];

    const seasonTokens = years.map(year => ({leagueId: league.id, year}));

    const imgProps: SpriteNodeAttributes = {
      type: 'sprite',
      image: assets.img.leagueSprite,
      crop: imgCoords,
    };

    const attrs: NodeAttributes = {
      nbaType: 'league',
      label: league.id, 
      size: config.sizes.league, 
      seasons: seasonTokens,
      color: config.nodeColors.default, 
      borderColor,
      ...imgProps, 
    };

    graph.addNode(league.id, attrs);
  });

  data.seasons.forEach(season => {
    const imgCoords = leagueImgLocations[season.leagueId];
    if (!imgCoords) throw new Error(`Unexpected error: no image for season ${season.id}`);

    const borderColor = leagueColors[season.leagueId]?.primary;
    if (!borderColor) throw new Error(`Unexpected error: no color for season ${season.id}`);

    const edgeColor = Color(borderColor).lighten(0.3).hex();

    const imgProps: SpriteNodeAttributes = {
      type: 'sprite',
      image: assets.img.leagueSprite,
      crop: imgCoords,
    };

    const attrs: NodeAttributes = {
      nbaType: 'season',
      name: `${season.leagueId} Season`,
      label: `${singleYearStr(season.year)} ${season.leagueId} Season`, 
      rollupId: season.leagueId,
      seasons: [{leagueId: season.leagueId, year: season.year}],
      color: config.nodeColors.default, 
      borderColor,
      size: config.sizes.season, 
      ...imgProps, 
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

    const imgCoords = playerImgLocations[player.id];

    const imgProps: SpriteNodeAttributes = imgCoords 
      ? {type: 'sprite', image: assets.img.playerSprite, crop: imgCoords}
      : defaultPlayerImage;

    const attrs: NodeAttributes = {
      nbaType: 'player',
      label: player.name, 
      seasons,
      size, 
      color: config.nodeColors.default, 
      borderColor: config.borderColors.player,
      ...imgProps, 
    };

    graph.addNode(player.id, attrs);
  });
  
  data.franchises.forEach(franchise => {
    const imgCoords = franchiseImgLocations[franchise.id] ?? teamImgLocations[TEAM_DEFAULT_CROP_ID];
    
    const imgProps: SpriteNodeAttributes = imgCoords ? 
      {type: 'sprite', image: assets.img.franchiseSprite, crop: imgCoords}
      : defaultTeamImage;

    const borderColor = franchiseColors[franchise.id]?.primary ?? config.borderColors.franchise;
    
    const franchiseTeams = data.teams.filter(team => team.franchiseId === franchise.id);
    const seasons = franchiseTeams.map(team => seasonsById[team.seasonId]).filter(notNull);
    const seasonTokens = seasons.map(season => ({leagueId: season.leagueId, year: season.year}));

    const attrs: NodeAttributes = { 
      nbaType: 'franchise',
      label: franchise.name, 
      seasons: seasonTokens,
      size: config.sizes.franchise, 
      color: config.nodeColors.default, 
      borderColor,
      ...imgProps, 
    };

    graph.addNode(franchise.id, attrs);
  });


  data.teams.forEach(team => {
    const label = `${team.name} (${singleYearStr(team.year)})`;

    const imgCoords = teamImgLocations[team.id];
    const fallbackImgCoords = franchiseImgLocations[team.franchiseId];
    
    let imgProps: SpriteNodeAttributes | null = null;

    if (imgCoords) {
      imgProps = {type: 'sprite', image: assets.img.teamSprite, crop: imgCoords};
    } else if (fallbackImgCoords) {
      imgProps = {type: 'sprite', image: assets.img.franchiseSprite, crop: fallbackImgCoords};
    } else {
      imgProps = defaultTeamImage;
    }
  
    const borderColor = teamColors[team.id]?.primary ?? config.borderColors.team;
    const leagueId = seasonsById[team.seasonId]?.leagueId;

    if (!leagueId) throw new Error(`Unexpected error: no leagueId for team ${team.name} ${team.year}`);

    const leagueColor = leagueColors[leagueId]?.primary;
    if (!leagueColor) throw new Error(`Unexpected error: no color for league ${leagueId}`);
    
    const teamEdgeColor = Color(borderColor).lighten(0.3).hex();
    const seasonEdgeColor = Color(leagueColor).lighten(0.3).hex();

    const attrs: NodeAttributes = { 
      nbaType: 'team',
      name: team.name,
      label, 
      rollupId: team.franchiseId,
      seasons: [{leagueId, year: team.year}],
      size: config.sizes.team, 
      color: config.nodeColors.default, 
      borderColor,
      ...imgProps,
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

    const[image, crop] = award.image.type === 'award'
      ? [assets.img.awardSprite, awardImgLocations[award.image.id]]
      : [assets.img.leagueSprite, leagueImgLocations[award.image.id]];

    if (!crop) throw new Error(`Unexpected error: no image for award ${award.name}, type ${award.image.type}`);

    const borderColor = award.image.type === 'award' 
      ? awardColors[award.image.id]?.primary 
      : leagueColors[award.image.id]?.primary;

    const imgProps: SpriteNodeAttributes = {type: 'sprite', image, crop};

    const attrs: NodeAttributes = {
      nbaType: 'award',
      name: award.name,
      label: award.name,
      seasons,
      color: config.nodeColors.award,
      borderColor: borderColor ?? config.borderColors.award,
      size: config.sizes.awardMax, // TODO: maybe filter by mvp, hof for max, others are default size?
      ...imgProps,
    };

    graph.addNode(award.id, attrs);
  });

  data.multiWinnerAwards.forEach(award => {
    const baseAward = awardsById[award.awardId];
    if (!baseAward) throw new Error(`Unexpected error: no base award for multi-winner award ${award.name}`);


    const[image, crop] = award.image.type === 'award'
      ? [assets.img.awardSprite, awardImgLocations[award.image.id]]
      : [assets.img.leagueSprite, leagueImgLocations[award.image.id]];

    if (!crop) throw new Error(`Unexpected error: no image for award ${award.name}, type ${award.image.type}`);

    const borderColor = award.image.type === 'award' 
      ? awardColors[award.image.id]?.primary 
      : leagueColors[award.image.id]?.primary;

    if (!borderColor) throw new Error(`Unexpected error: no color for award ${award.name}`);
    
    const edgeColor = Color(borderColor).lighten(0.3).hex();

    const label = award.name.includes('All-Star') ? `${award.name} (${award.year})` : `${award.name} (${singleYearStr(award.year)})`;

    const imgProps: SpriteNodeAttributes = {type: 'sprite', image, crop};

    const attrs: NodeAttributes = {
      nbaType: 'multi-winner-award',
      name: award.name,
      label: label,
      rollupId: baseAward.id,
      seasons: [{leagueId: baseAward.leagueId, year: award.year}],
      color: config.nodeColors.award,
      borderColor: borderColor,
      size: config.sizes.awardDefault,
      ...imgProps,
    };
    
    graph.addNode(award.id, attrs);
    graph.addEdge(award.awardId, award.id, {color: edgeColor, hidden: true});
  });

  // *************
  // *** EDGES ***
  // *************

  data.playerSeasons.forEach(pt => {
    const teamPalette = teamColors[pt.teamId];
  
    const color = teamPalette
      ? Color(teamPalette.primary).lighten(0.3).hex()
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

      const borderColor = award.image.type === 'award' 
      ? awardColors[award.image.id]?.primary 
      : leagueColors[award.image.id]?.primary;

      if (!borderColor) throw new Error(`Unexpected error: no color for award ${award.name}`);
      
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
