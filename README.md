# nba-graph

Graph view of basketball-reference NBA data. Contains two main components, a scraper for downloading and saving the data, and a UI for visualizing it.

### setup

Install deps (build runs using babel and webpack)

```
npm install
```

Build

```
// build graph CLI tool
npm run build:graph

// build graph and watch for change
npm run watch:graph

// build app
npm run build:app

// build app, watch for changes and serve with dev server
npm run serve:app
```

### graph

The `graph` module is a CLI tool which downloads and parses NBA data from `www.basketball-reference.com`, and builds a graph from the output. 

Output data is stored under `/data`, first as `.html` files from the initial download, then as `.json` files after the data is parsed. 

Some download commands can be run in any order, while some require data to exist before they can be run. Suggested order for downloads is: `leagues`, `teams`, `seasons`, `players-index`, then `players`.

Afterwards, extraction commands can be run in any order: `extract-{leagues,franchises,teams,seasons,players}`.

Run graph

```
TODO
```

### graph

The graph is built and constructed via the `--build-graph` command, and stored in `/data/graph.json`. It using the same graph library the frontend uses to render the graph. 

Run graph builder

```
TODO
```

### refs
* http://sigmajs.org/
* https://sim51.github.io/react-sigma/
* https://github.com/graphology/graphology
* https://graphology.github.io
* highlighting nodes: https://github.com/sim51/react-sigma/blob/main/website/src/components/GraphDefault.tsx#L65

### todo
* improve scraper by downloading pages, then later extracting data (less brittle)
* consider adding interesting metadata for visualization (team wins, player WS)
* better error handling in command
* create webserver for serving graph data
* UI
* Upload final datasets to S3
