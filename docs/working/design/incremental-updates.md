### how to apply incremental updates?

**Issue**

Currently we have all historical data up to the start of the 23/24 season. How to apply incremental updates on top of that?

The system is set up to fetch all data, and parse into entities. However this is quite slow. It'd be better to just apply updates going forward, but it'd also be nice to not have to rewrite too much of the system. 

**Current process**
* download league index (nba-2023, aba-1960)
* download franchise index
* download teams (MIN, GSW)
* download player index (curryst, lebronj)
* download player (curryst + all seasons of playing)
* download franchise images (MIN, GSW)
* download team images (MIN-2023, GSW-1990)
* download player images (curryst, lebronj) (note: these can change over time, but we only use the most recent)
* download awards (hof, all-star, roy)
* parse all these things (most 1:1 with downloads, but players expand into player entities and player-season entities)

**Incremental Option 1**
* set current season (eg. 2023/24) 
* re-download cheap things (easier than diffing first)
  * download league index (nba-2023, aba-1960)
  * download franchise index
  * download teams (MIN, GSW)
  * download awards
* down only current season for expensive things
  * download team season (MIN-2024, GSW-2024) (this is new, we don't download these currently)
  * download players on team season rosters ^
  * download franchise images for current season
  * download team images for current season
  * download player images for current season
* parser updates
  * incremental updates will come from a different path, how do?
  * some parsers may need a way to filter (or maybe just filter output -- eg. all player seasons, filter for 2024?)
* apply diff
  * I think just need to compare to existing parsed entities, does id exist, if not insert

This option is ok, but after digging more into it, the process of downloading and storing `incremental` data is a pretty be shift from the current process. We'd need a lot of re-wiring at the storage layer. Possible, but maybe not worth it.

**Incremental Option 2**

The goal of this option is to re-write as little as possible. The biggest way we do this is be re-download and overwriting existing data in place as opposed to creating a new directly for incremental changes. Obviously not the enterprise solution approach, but given the existing system this will probably be the easiest to implement...

* set current season (eg. 2023/24) 
* re-download cheap things, save in existing location
  * download league index (nba-2023, aba-1960)
  * download franchise index
  * download teams (MIN, GSW)
  * download player index (curryst, lebronj)
  * download awards
* down only current season for expensive things
  <!-- * download team season (MIN-2024, GSW-2024) (this is new, we don't download these currently) -->
  * download players with last active season == current season (this is new)
  * download franchise images (only for active teams?)
  * download team images for current season
  * download player images for current season
* parser updates
  * probably only player index parser needs an update (filter on active only)
* apply diff
  * I think just need to compare to existing parsed entities, does id exist, if not insert
