import Graph, { DirectedGraph } from "graphology";
import { circular } from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";
import Color from "color";

import { NBAData, Season } from "../../shared/nba-types";
import { NodeAttributes, SpriteNodeAttributes } from "../../shared/types";
import { assets } from "../util/assets";
import { GraphConfig } from "./config";
import { loadSpriteColors, loadSpriteMapping } from "../storage";
import { notNull, singleYearStr } from "../../shared/util";

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

const DEFAULT_IMAGE_CROP = {x: 0, y: 0, width: 128, height: 128};

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

  const playerSeasons: {[playerId: string]: Season[]} = data.playerSeasons.reduce<{[playerId: string]: Season[]}>((acc, ps) => {
    const prev = acc[ps.playerId] ?? [];

    const team = teamsById[ps.teamId];
    if (!team) throw new Error(`Unexpected error: no team for player ${ps.playerId} ${ps.year}`);

    const season = seasonsById[team.seasonId];
    if (!season) throw new Error(`Unexpected error: no season for player ${ps.playerId} ${ps.year}`);

    prev.push(season);
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

    const attrs: NodeAttributes = {
      nbaType: 'league',
      label: league.id, 
      size: config.sizes.league, 
      years,
      color: config.nodeColors.default, 
      borderColor,
      leagues: [league.id],
      type: 'sprite',
      image: assets.img.leagueSprite,
      crop: imgCoords, 
    };

    graph.addNode(league.id, attrs);
  });

  data.seasons.forEach(season => {
    const imgCoords = leagueImgLocations[season.leagueId];
    if (!imgCoords) throw new Error(`Unexpected error: no image for season ${season.id}`);

    const borderColor = leagueColors[season.leagueId]?.primary;
    if (!borderColor) throw new Error(`Unexpected error: no color for season ${season.id}`);

    const edgeColor = Color(borderColor).lighten(0.3).hex();

    const attrs: NodeAttributes = {
      nbaType: 'season',
      name: `${season.leagueId} Season`,
      label: `${singleYearStr(season.year)} ${season.leagueId} Season`, 
      size: config.sizes.season, 
      years: [season.year],
      color: config.nodeColors.default, 
      borderColor,
      rollupId: season.leagueId,
      leagues: [season.leagueId],
      type: 'sprite',
      image: assets.img.leagueSprite,
      crop: imgCoords, 
    };

    graph.addNode(season.id, attrs);
    graph.addEdge(season.leagueId, season.id, {color: edgeColor, hidden: true});
  });

  data.players.forEach(player => {
    // TODO: more sophisticated size calculation, using seasons, awards, etc.
    const seasons = playerSeasons[player.id];
    if (!seasons) throw new Error(`Unexpected error: no years active for player ${player.name}`);
    const yearsAll = seasons.map(x => x.year).sort();
    const years = [...new Set(yearsAll)];
    const end = years[years.length - 1];

    const size = (years.length <= 3 && end !== 2023) ? config.sizes.playerMin : config.sizes.playerDefault;

    const imgCoords = playerImgLocations[player.id];

    const leagues = seasons.map(season => season.leagueId);
    const leagueIds = [...new Set(leagues)];
    
    const imgProps: SpriteNodeAttributes = imgCoords 
      ? {type: 'sprite', image: assets.img.playerSprite, crop: imgCoords}
      : {type: 'sprite', image: assets.img.playerDefault, crop: DEFAULT_IMAGE_CROP};

    const attrs: NodeAttributes = {
      nbaType: 'player',
      label: player.name, 
      size, 
      years,
      color: config.nodeColors.default, 
      borderColor: config.borderColors.player,
      leagues: leagueIds,
      ...imgProps, 
    };

    graph.addNode(player.id, attrs);
  });
  
  data.franchises.forEach(franchise => {
    const imgCoords = franchiseImgLocations[franchise.id];
    
    const imgProps: SpriteNodeAttributes = imgCoords
      ? {type: 'sprite', image: assets.img.franchiseSprite, crop: imgCoords}
      : {type: 'sprite', image: assets.img.teamDefault, crop: DEFAULT_IMAGE_CROP};

    const borderColor = franchiseColors[franchise.id]?.primary ?? config.borderColors.franchise;
    
    const franchiseTeams = data.teams.filter(team => team.franchiseId === franchise.id);
    const years = franchiseTeams.map(team => team.year).sort();
    const leagues = franchiseTeams.map(team => seasonsById[team.seasonId]?.leagueId).filter(notNull);
    const leagueIds = [...new Set(leagues)];

    const attrs: NodeAttributes = { 
      nbaType: 'franchise',
      label: franchise.name, 
      size: config.sizes.franchise, 
      color: config.nodeColors.default, 
      borderColor,
      leagues: leagueIds,
      years,
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
      imgProps = {type: 'sprite', image: assets.img.teamDefault, crop: DEFAULT_IMAGE_CROP};
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
      size: config.sizes.team, 
      color: config.nodeColors.default, 
      borderColor,
      rollupId: team.franchiseId,
      leagues: [leagueId],
      years: [team.year],
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

    let years = [...new Set(potentialYearsAll)];
    let leagues = [award.leagueId];
    
    // this will be the case for lifetime awards that don't have years
    // in this case just use the cumulative career years of all the recipients
    if (years.length === 0) {
      const recipientSeasons = recipients.map(x => playerSeasons[x.recipientId]).flat().filter(notNull);
      const recipientYears = recipientSeasons.map(x => x.year).sort();
      years = [...new Set(recipientYears)];

      // also kind of hacky, but for lifetime awards just use the cumulative leagues of all the recipients
      // other awards know their league at parse time, but lifetime awards don't have easy access to that info
      leagues = [...new Set(recipientSeasons.map(x => x.leagueId))];
    }

    const image = award.image.type === 'award' ? assets.img.awardSprite : assets.img.leagueSprite;
    const crop = award.image.type === 'award' ? awardImgLocations[award.image.id] : leagueImgLocations[award.image.id];

    if (!crop) throw new Error(`Unexpected error: no image for award ${award.name}, type ${award.image.type}`);

    const borderColor = award.image.type === 'award' 
      ? awardColors[award.image.id]?.primary 
      : leagueColors[award.image.id]?.primary;

    const attrs: NodeAttributes = {
      nbaType: 'award',
      name: award.name,
      label: award.name,
      color: config.nodeColors.award,
      borderColor: borderColor ?? config.borderColors.award,
      size: config.sizes.awardMax, // TODO: maybe filter by mvp, hof for max, others are default size?
      type: 'sprite',
      image,
      leagues,
      years,
      crop
    };

    graph.addNode(award.id, attrs);
  });

  data.multiWinnerAwards.forEach(award => {
    const baseAward = awardsById[award.awardId];
    if (!baseAward) throw new Error(`Unexpected error: no base award for multi-winner award ${award.name}`);

    const image = award.image.type === 'award' ? assets.img.awardSprite : assets.img.leagueSprite;
    const crop = award.image.type === 'award' ? awardImgLocations[award.image.id] : leagueImgLocations[award.image.id];

    if (!crop) throw new Error(`Unexpected error: no image for award ${award.name}, type ${award.image.type}`);

    const borderColor = award.image.type === 'award' 
      ? awardColors[award.image.id]?.primary 
      : leagueColors[award.image.id]?.primary;

    if (!borderColor) throw new Error(`Unexpected error: no color for award ${award.name}`);
    
    const edgeColor = Color(borderColor).lighten(0.3).hex();

    const label = award.name.includes('All-Star') ? `${award.name} (${award.year})` : `${award.name} (${singleYearStr(award.year)})`;

    const attrs: NodeAttributes = {
      nbaType: 'multi-winner-award',
      name: award.name,
      label: label,
      color: config.nodeColors.award,
      borderColor: borderColor,
      size: config.sizes.awardDefault,
      type: 'sprite',
      image,
      rollupId: baseAward.id,
      leagues: [baseAward.leagueId],
      years: [award.year],
      crop,
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
