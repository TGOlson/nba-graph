# nba-graph

Graph visualization of historical NBA data

### setup

Install deps

```
npm install
```

Build

```
// build graph CLI tool
npm run build:graph

// build graph and watch for changes
npm run watch:graph

// build app
npm run build:app

// build app, watch for changes and serve with dev server (served @ localhost:3000)
npm run serve:app
```

### graph

The `graph` module is a CLI tool which downloads and parses NBA data from `www.basketball-reference.com`, and builds a graph from the output. 

```
$ node ./dist/graph.bundle.js <command>

Available commands:
 [
  {
    LeagueIndex: '--download-league-index',
    TeamIndex: '--download-team-index',
    Team: '--download-team',
    TeamAll: '--download-team-all',
    PlayerIndex: '--download-player-index',
    PlayerIndexAll: '--download-player-index-all',
    Player: '--download-player',
    PlayerGroup: '--download-player-group',
    PlayerAll: '--download-player-all',
    FranchiseImages: '--download-franchise-images',
    TeamImages: '--download-team-images',
    PlayerImages: '--download-player-images'
  },
  {
    Leagues: '--parse-leagues',
    Seasons: '--parse-seasons',
    Franchises: '--parse-franchises',
    Teams: '--parse-teams',
    Players: '--parse-players'
  },
  { ConvertImages: '--convert-images', Test: '--test' },
  { Build: '--build-graph' }
]
```

1. Downloading data

`node ./dist/graph.bundle.js --download-<...>`

All output data is stored in `./data`. Initial downloads are stored as raw `.html` files (which is later parsed into `.json`).

Some download commands have dependencies on other data before they can be run. It is suggested to run download commands in the order listed above (league index -> team index -> team ...).

_note: some commands may take a while to finish as basketball-reference severly rate limits requests_

2. Parsing

`node ./dist/graph.bundle.js --parse-<...>`

After the data is downloaded, it can then be parsed into json files. Parsing commands can be run in any order.

3. Creating the graph

`node ./dist/graph.bundle.js --build-graph`

Lastly, once all the data is downloaded and parsed, an output graph can be created.

The output graph data is stored in `./data/graph/graph.json`. The graph is built and constructed using the `graphology` library, which is the same graph library the frontend uses to render the graph. 

### refs
* http://sigmajs.org/
* https://sim51.github.io/react-sigma/
* https://github.com/graphology/graphology
* https://graphology.github.io
* highlighting nodes: https://github.com/sim51/react-sigma/blob/main/website/src/components/GraphDefault.tsx#L65
* large graph FA2 rendering: https://codesandbox.io/s/github/jacomyal/sigma.js/tree/main/examples/large-graphs?file=/index.ts:234-307

### todo
* ~~test rendering sprites (basic + webgl)~~
* ~~render multiple sprites~~
* ~~sprite performance optimizations~~
* data
  * ~~download player images + create sprite~~
  * ~~improve player parser to use players/x/xxx.html files for better info (seasons, all-stars, etc)~~
  * ~~add other interesting nodes (MVP, champion, X time all star, YY year all-star, YY year all-nba)~~
  * improve locations (do this last after adding more node types)
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
  * search
    * sort by last name in search bar
    * search is a little laggy?
    * a way to collapse team/award years in search?
    * when nodes are filtered from graph, remove from search results
  * adjust player node size for awards
  * compress graph json?
  * fun AI logo
* deploy
 * setup github page (TODO: where to store data?)
 * deploy assets to aws/cloudflair
