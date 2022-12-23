# nba-graph

Graph view of basketball-reference NBA data. Contains two main components, a scraper for downloading and saving the data, and a UI for visualizing it.

### setup

Install deps (build runs using babel and webpack)

```
npm install
```

Build

```
// Build once
npx webpack

// Run dev-server and rebuild on changes
npx webpack serve
```

Run scraper

```
node dist/server.bundle.js <command>
```

Available commands:
[
  '--read-seasons',
  '--read-leagues',
  '--read-franchises',
  '--read-teams',
  '--read-players',
  '--read-player-teams',
  '--write-seasons',
  '--write-franchises',
  '--write-teams',
  '--write-players',
  '--write-player-teams'
]

Note: sequencing of commands is a little brittle. You must `write-seasons` before reading, but also need to run writers sequencially the first time to populate data (TODO: should clean this up later).

Run server

```
// TODO!
```

#### refs
* http://sigmajs.org/
* https://github.com/jacomyal/sigma.js/wiki

### todo
* improve scraper by downloading pages, then later extracting data (less brittle)
* consider adding interesting metadata for visualization (team wins, player WS)
* better error handling in command
* create webserver for serving graph data
* UI
* Upload final datasets to S3
