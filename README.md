# nba-graph

Visualizing basketball history. https://nbagraph.com

## About

This project is an experiment to view NBA history in a new way. I want it to be like browsing www.basketball-reference.com, but all at once. 

What you see is a large [graph](https://en.wikipedia.org/wiki/Graph_(abstract_data_type)) that includes every player, team, franchise, award (and more!) that has ever existed in basketball history.

In all, the graph contains: 5108 players, 1728 teams, 325 awards, 86 seasons, 53 franchises, and 3 professional basketball leagues. All connected by over 37,000 [edges](https://en.wikipedia.org/wiki/Glossary_of_graph_theory#edge).

As of today, it encompasses the entirety of basketball history up until the end of the 2022-23 season. That means Victor Wembanyama isn't on the graph yet, and Damian Lillard's last season is still on the Blazers -- but once the 2023-24 season kicks off all this will be updated!

This project originally started out as a way to see how NBA team logos have evolved over time (which is super btw, you can see that [here](https://www.reddit.com/r/nba/comments/10ryoq1/nba_team_logos_over_time/)). 

## How-to

I'll admit, the graph is kind of wild and a bit overwhelming at first, but the only goal is to explore. 

Sometimes I find it fun to start on the `NBA` node, then click on a season, and see who won the title, what the roster was like, and who there best player was. 

Other times I like to search for a favorite player (cough-Penny Hardaway-cough), and re-live the teams they played for and awards they accumulated.

And other times it's fun to just click-click-click until you end up looking at a 1948 BAA team only existed for a single season : )

## Some more details

Technically, this has been a pretty cool project to work on. At a high level it has consisted of:

* Scrapping and parsing close to the *entirety* of basketball-reference data (or at least upwards of 95% of it)
* Constructing graph entities from the parsed data using [`graphology`](https://graphology.github.io/)
* Rendering the constructed graph with WebGL using [`sigma.js`](https://github.com/jacomyal/sigma.js)

There was also *a lot* of UI tinkering required to make displaying 7k+ interconnected nodes look semi-reasonable. 

This project also had some unique challenges given the size and scope of the graph. The largest of which was that there were over 4k unique player and team images to display. To support these in the graph I had to generate large sprite files for the images, and rewrite a large portion of the `sigma.js` WebGL node rendering logic to support sprite rendering and image scaling.

Lastly, if you're curious to get your hands dirty with this project, check out the [dev docs](docs/dev.md) to get started, and feel free to open a PR or issue with any ideas for changes!
