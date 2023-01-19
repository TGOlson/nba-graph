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

1. Downloading data

Output data is stored in `./data`, first as `.html` files from the initial download, then as `.json` files after the data is parsed. To download data, the following commands can be used: 

`node graph.bundle.js --download-{leagues,teams,seasons,players-index,players}`

Some download commands can be run in any order, while some require data to exist before they can be run. Suggested order for downloads is: `leagues`, `teams`, `seasons`, `players-index`, then `players`.

_note: some commands may take a while to finish as basketball-reference severly rate limits requests_

2. Parsing

After the data is downloaded, it can then be parsed into json files. Parsing commands can be run in any order.

`node graph.bundle.js --parse-{leagues,seasons,franchises,teams,players,player-seasons}`

3. Creating the graph

Lastly, once all the data is downloaded and parsed, an output graph can be created.

`node graph.bundle.js --build-graph`

The output graph data is stored in `./data/graph/graph.json`. The graph is built and constructed using the `graphology` library, which is the same graph library the frontend uses to render the graph. 

### refs
* http://sigmajs.org/
* https://sim51.github.io/react-sigma/
* https://github.com/graphology/graphology
* https://graphology.github.io
* highlighting nodes: https://github.com/sim51/react-sigma/blob/main/website/src/components/GraphDefault.tsx#L65

### todo
* test rendering sprites (basic + webgl)
* improve locations
* improve / fix search to move to current node
* test animations for force layout and other movements 
* test moving neighbors in a circle around selected node (and keeping them there... animation?)
* add other interesting nodes (MVP, champion, X time all star)
* filters and advanved search
