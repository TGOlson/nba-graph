# nba-graph

Graph view of basketball-reference NBA data. Contains two main components, a scraper for downloading and saving the data, and a UI for visualizing it.

### setup

(Download and install neo4j)[https://neo4j.com/download/]

```
$ cd nba-graph/cmd/scraper
$ go build
$ ./scraper --update_all
```

Note: `--update_all` is required to initialize the full dataset (this might take a while, in particular the player dataset has to crawl quite a few pages). Run `./scraper` to see full set of usage options.

*UI*

Install http://sigmajs.org/ somehow...

```
$ python -m SimpleHTTPServer
```

Navigate to `http://localhost:8000/app/`

#### refs
* http://sigmajs.org/
* https://github.com/jacomyal/sigma.js/wiki

### todo
* add team->season relationship
* consider adding interesting metadata for visualization (team wins, player WS)
* better error handling in command
* create webserver for serving graph data
* UI
* Upload final datasets to S3
