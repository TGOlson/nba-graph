# dev

### quick start

1. Clone repo
2. Install deps: `npm install`
3. Pull large files: `git lfs pull` (make sure `git-lfs` is installed)
4. Start graph cli tool: `npm run graph:watch`
5. Build sprites: `node ./dist/graph.bundle.js --convert-images` (will take a few mintues)
5. Build graph entities: `node ./dist/graph.bundle.js --build-graph`
6. Serve app: `npm run app:serve` (@ localhost:3000)

And that's it! More details about certain steps below. 

### setup

Install deps

```
npm install
```

Build

```
// build or watch graph CLI tool
npm run graph:{build,watch}

// build or serve app  with dev server (served @ localhost:3000)
npm run app:{build,serve}
```

### bootstapping

Bootstrapping this project from scratch is possible, but will take quite a long time (>5 hours of download time from `www.basketball-reference.com` due to rate limiting).

Use the below commands from the graph cli tool to download and generate files. 

_note: if you plan on bootstrapping the data from scratch, skip the `git lfs` commands_


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
    PlayerImages: '--download-player-images',
    Awards: '--download-awards',
    AllStar: '--download-allstar'
  },
  {
    Leagues: '--parse-leagues',
    Seasons: '--parse-seasons',
    Franchises: '--parse-franchises',
    Teams: '--parse-teams',
    Players: '--parse-players',
    Awards: '--parse-awards'
  },
  {
    ConvertImages: '--convert-images',
    ParsePrimaryColors: '--parse-primary-colors',
    Test: '--test'
  },
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

3. Building sprites

`node ./dist/graph.bundle.js --convert-images`
`node ./dist/graph.bundle.js --parse-primary-colors`

Create sprites and color palettes using downloaded images.

4. Creating the graph

`node ./dist/graph.bundle.js --build-graph`

Lastly, once all the data is downloaded and parsed, an output graph can be created.

The output graph data is stored in `./data/graph/` as `json` files. The graph is built and constructed using the `graphology` library.

### refs
* http://sigmajs.org/
* https://sim51.github.io/react-sigma/
* https://github.com/graphology/graphology
* https://graphology.github.io
* highlighting nodes: https://github.com/sim51/react-sigma/blob/main/website/src/components/GraphDefault.tsx#L65
* large graph FA2 rendering: https://codesandbox.io/s/github/jacomyal/sigma.js/tree/main/examples/large-graphs?file=/index.ts:234-307
