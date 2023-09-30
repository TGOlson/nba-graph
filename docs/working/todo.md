_note: files in this directory are working docs, used to track in-progress design and todos. a lot of things in this directory may be outdated or incomplete_

### todo
* ~~test rendering sprites (basic + webgl)~~
* ~~render multiple sprites~~
* ~~sprite performance optimizations~~
* data
  * ~~download player images + create sprite~~
  * ~~improve player parser to use players/x/xxx.html files for better info (seasons, all-stars, etc)~~
  * ~~add other interesting nodes (MVP, champion, X time all star, YY year all-star, YY year all-nba)~~
* UI 
  * ~~improve / fix search to move to current node~~
  * ~~add years active / type to search results~~
  * ~~larger images (I think don't downside on sprite generation?)~~
  * ~~improve node sizes~~
  * ~~placeholders for teams/players without images~~
  * ~~more fun edge colors (based on team primary?)~~
  * ~~filters (toggle awards, low minute players, toggle leagues?) and advanced search (idk?)~~
* hacks
  * ~~test animations for force layout and other movements~~
  * ~~test moving neighbors in a circle around selected node (and keeping them there... animation?)~~
  * ~~try to improve sprite generation, some heads are off center?~~
* small cleanups
  * ~~some edge colors are funky (check spurs 1981/1982)~~
  * ~~darken circle around teams (right now it's just primary color)~~
  * ~~add padding and background to award images~~
  * ~~a few filter cleanups~~
    * ~~validation or something for year text inputs~~
    * ~~remove HOF and other lifetime awards if all recipients are filtered out~~
    * ~~lifetime award leagues don't seem right (just NBA right now?)~~
    * ~~when filtering down to just 2022 season should all MVPs be shown?~~
  * ~~more fun logos for awards~~
  * ~~search~~
    * ~~a way to collapse team/award years in search?~~
    * ~~when nodes are filtered from graph, remove from search results~~
    * ~~sort by last name in search bar~~
    * ~~search is a little laggy? (try loading images async)~~
  * ~~larger league images~~
  * ~~images~~
    * ~~compress sprites images~~
  * ~~infinite scroll~~
  * ~~fix no results popup on search~~
  * ~~bug when player matches year filter, but not league filter (eg. played in ABA & 1950, but no matching teams)~~
* deploy
 * ~~setup github page~~
* last cleanups
  * ~~consider breaking up player sprite by last name~~
  * ~~more cool side panel things to look at~~
  * ~~better mobile support~~
  * ~~mobile labels get too big~~
  * ~~start graph at good zoom / location~~
  * ~~adjust player node size for awards~~
  * ~~improve locations (do this last after adding more node types)~~
  * ~~graph load~~
  * ~~[cleanup] goto node doesn't work on small screens because of overflow...~~
  * ~~[images] fun AI logo -> kinda, keep it simple : )~~
  * ~~[experiment] fastest path search? => separate project~~
  * ~~[images] favicon~~
  * ~~[cleanup] git lfs to store scraped data?~~
  * ~~[error-handling] catch errors for too small of texture size support (aim for 4kx4k)~~
  * faster serving of assets?
  * [cleanup] update readme, move docs around
  * [experiment] shareable urls?
  * custom url
