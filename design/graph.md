### nodes

League (NBA, ABA)
  - leagueID
  - url

Season (NBA_2019, ABA_1968)
  - seasonID
  - leagueID
  - year
  - url

 Franchise (MIN, LAL)
  - franchiseID
  - name
  - url

Team (MIN_2019, LAL_2017)
  - teamID
  - franchiseID
  - seasonID
  - year
  - name
  - url

Player
  - playerID
  - name
  - url

PlayerTeams (links a player with a team -- these will be nodes, not edges)
  - playerID
  - teamID

### relationships

Season -> PART_OF   -> League
Team   -> SEASON_OF -> Franchise
Team   -> PLAYED_IN -> Season
Player -> PLAYED_ON -> Team

### questions

How to express what year a player played in?
- teams have a year property

How to express what year a league existed?
- leagues have a year property

How to find teammates of a player?
- traverse player -> teams -> players

                  NBA 2017/18
                     |
               |- Rockets 2017/18 - (CP, Gordon)
               |- Rockets 2016/17 - (Lou, Gordon)
James Harden - |- Rockets 2015/16 - (Ariza, Dwight)
               |- ...
               |- Thunder 2011/12 - (KD, Russ)
                     |
                  NBA 2017/18

Should this also include a notion of a franchise?
- teams w/o years, team-years are a part of a franchise?

How to express all teams James Harden has played on?
- player->PLAYS_ON->teams

How to express all teammates Harden had in 2018
- player->PLAYS_ON->team<-PLAY_ON<-player (where year = 2018)
- this works for the graph layer, what about UI?

How to express all teammates Harden had ever
- player->PLAYS_ON->team<-PLAY_ON<-player

### alternative

_won't work because you can't associate which year a player was on a team_

  NBA 2011/12
     |       |- OKC
James Harden |- Rockets
     |
  NBA 2017/18

- alternative design might use league-years and drop concept of team-years
- query league-years + team to get roster
- players are related to both league years and team
- teams are singular, related to league-years (NBA-2017/18 <- MIN -> NBA-2018/19)
- upside to this is that teams are the focal point and represented more naturally
- also removes constraint of league/year matching team/year, relies more on relationships
