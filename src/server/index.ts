import { League, fromSeasons } from './league';
import { Season, getSeasons } from './season';

async function main() {
  const seasons: Season[] = await getSeasons();
  const leagues: League[] = fromSeasons(seasons);
  
  console.log(seasons, leagues);
}

main();
