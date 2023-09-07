
### single winner awards
* all modeled as: player -> XX year award -> award
* TODO: this would feel a lot better if it was somehow just player -> MVP (but need to know year somehow)
* could use edge label to display year, but no other node/edge combo uses that model

links
* MVP: https://www.basketball-reference.com/awards/mvp.html
* dpoy: https://www.basketball-reference.com/awards/dpoy.html
* roy: https://www.basketball-reference.com/awards/roy.html
* 6th moy: https://www.basketball-reference.com/awards/smoy.html
* mip: https://www.basketball-reference.com/awards/mip.html
* tmoy: https://www.basketball-reference.com/awards/tmoy.html
* citizen: https://www.basketball-reference.com/awards/citizenship.html
* all-star mvp: https://www.basketball-reference.com/awards/all_star_mvp.html
* finals MVP: https://www.basketball-reference.com/awards/finals_mvp.html

### multi-winner awards
player -> XX year award -> award
need to scrape each year

links
* all-star (need to scrape all years): https://www.basketball-reference.com/allstar/
* all-nba: https://www.basketball-reference.com/awards/all_league.html
* all-rookie: https://www.basketball-reference.com/awards/all_rookie.html
* all-defense: https://www.basketball-reference.com/awards/all_defense.html

### team awards
* XX year team -> NBA champ

links
* nba champ: https://www.basketball-reference.com/playoffs/

### lifetime awards
* player -> award

links
* hof: https://www.basketball-reference.com/awards/hof.html
* 75th anniversary: https://www.basketball-reference.com/awards/nba_75th_anniversary.html
* 50th anni: https://www.basketball-reference.com/awards/nba_50_greatest.html
* bill simmons hall of fame: https://www.basketball-reference.com/awards/simmons_pyramid.html
* aba-all time team: https://www.basketball-reference.com/awards/aba_all_time_team.html 

### modeling options

seperate models

export type Award = {
  id: string,
  leagueId: string,
  name: string,
};

// right now this is a slightly overloaded type
// use it to express edges and a single node
// it's overloaded...
// a better modeling would be:
// player -> season award winner (edge from player to award) -> season award (yearly node) -> award (single node)
export type SeasonAward = {
  id: string,
  name: string,
  awardId: string,
  playerId: string,
  year: number,
};

// simple for single winners
player (lebron) -> seasonaward (2015 mvp) -> award (mvp)

// weird for multi winners?

player (lebron) ->
player (curry) -> all-star (2015) -> all-star
player (kd) -> 
