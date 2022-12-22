import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import https from 'node:https';

import { fromRelative } from '../util/bref-url';
import { Player } from './player';

export type PlayerTeam = {
  playerId: string;
  teamId: string;
  url: string;
}

const SELECTOR = 'table#per_game tbody tr';
const URL_REGEX = /teams\/([A-Z]{3})\/(\d{4}).html/

export async function getPlayerTeams(agent: https.Agent, player: Player): Promise<PlayerTeam[]> {
  const response = await fetch(fromRelative(player.url), { agent });
  const body = await response.text();
  
  const $ = cheerio.load(body)

  return $(SELECTOR).toArray().map((el: cheerio.AnyNode) => {
    const playerLink = $('th a', el).attr('href');
    const teamLink = $('td[data-stat="team_id"] a', el).attr('href');

    if (!playerLink || !teamLink) {
      throw new Error('Invalid response from player: no link')
    }
    
    const res = URL_REGEX.exec(teamLink);
        
    if (!res) {
      throw new Error('Invalid response from team: unparseable url')
    } 
    
    const [__, franchiseId, year] = res;
    
    return {
      playerId: player.id,
      teamId: `${franchiseId}_${year}`,
      url: playerLink,
    }
  });
}
