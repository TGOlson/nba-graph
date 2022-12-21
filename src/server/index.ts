import { League, fromSeasons } from './scraper/league';
import { Season, getSeasons } from './scraper/season';
import { Franchise, getActiveFranchises, getDefunctFranchises } from './scraper/franchise';

async function main() {
  // const seasons: Season[] = await getSeasons();
  // const leagues: League[] = fromSeasons(seasons);
  
  const activeFranchises: Franchise[] = await getActiveFranchises();
  const defunctFranchises: Franchise[] = await getDefunctFranchises();
  const franchises = [...activeFranchises, ...defunctFranchises];

  

  console.log(franchises);
}

main();
