import * as Scraper from "./scraper";

Scraper.run()
  .then(() => console.log('Scraper done!'))
  .catch(err => console.log('Error running scraper:', err));
