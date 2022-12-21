import { League, fromSeasons } from './scraper/league';
import { Season, getSeasons } from './scraper/season';
import { Franchise, getActiveFranchises, getDefunctFranchises } from './scraper/franchise';
import { getTeams, Team } from './scraper/team';
import { getPlayers, Player } from './scraper/player';

async function main() {
  // const seasons: Season[] = await getSeasons();
  // const leagues: League[] = fromSeasons(seasons);
  
  // const activeFranchises: Franchise[] = await getActiveFranchises();
  // const defunctFranchises: Franchise[] = await getDefunctFranchises();
  // const franchises = [...activeFranchises, ...defunctFranchises];

  // const franchise: Franchise = {
  //   id: 'ATL',
  //   name: 'Atlanta Hawks',
  //   url: { x: '{br}/teams/ATL/' },
  //   active: true
  // }

  // // call this for all franchises
  // const teams: Team[] = await getTeams(franchise);

  const team: Team = {
    id: 'ATL_2023',
    franchiseId: 'ATL',
    seasonId: 'NBA_2023',
    name: 'Atlanta Hawks',
    year: 2023,
    url: { x: '{br}/teams/ATL/2023.html' }
  }

  const players: Player[] = await getPlayers(team);

  console.log(players);
}

main();
