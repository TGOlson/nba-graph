import React, { useEffect, useState } from 'react';

import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';


import { fetchGraphData } from '../api';
import { logDebug } from '../util/logger';
import { NBAGraphNode } from '../../shared/types';
import { CardOverflow, Typography } from '@mui/joy';
import { multiYearStr } from '../../shared/util';

import { useNavigate } from 'react-router-dom';

const LogoPage = () => {
  const [franchises, setFranchises] = useState<NBAGraphNode[]>([]);
  const [teams, setTeams] = useState<{[key: string]: NBAGraphNode[]}>({});

  const navigate = useNavigate();

  // const [sprites, setSprites] = useState<Sprite[] | null>(null);
  // const [showTextureWarningModal, setShowTextureWarningModal] = useState<boolean>(false);
  
  useEffect(() => {
    logDebug('Fetching graph data');
    void fetchGraphData().then((data) => { 
      const franchises = data.nodes
        .filter(x => x.attributes.nbaType === 'franchise')
        .sort((a, b) => a.attributes.label.localeCompare(b.attributes.label));

      setFranchises(franchises);

      const teams = data.nodes.filter(x => x.attributes.nbaType === 'team');
      const teamsByFranchise = teams.reduce<{[key: string]: NBAGraphNode[]}>((acc, team) => {
        const franchiseId = team.attributes.rollupId as string;
        const prev = acc[franchiseId] ?? [];

        prev.push(team);
        acc[franchiseId] = prev;

        return acc;
      }, {});

      setTeams(teamsByFranchise);

    }).catch((err) => { throw err; });
  }, []);

  return (
    <Box>
      {franchises.map((franchise) => {
        const franchiseTeams = teams[franchise.key] ?? [];

        const teamLogos = franchiseTeams.map((team) => {
          const { image, crop } = team.attributes;
          const {width, height, x, y} = crop;

          const size = 125;
          return ( 
            <Box 
              className='logo-container'
              key={team.key}
              sx={{
                display: 'flex',
                position: 'relative',
                // width: '100px',
                // height: '100px',
              }}
            >
            <Box 
              onClick={() => navigate(`/${team.key}`)} 
              className='logo-overlay'
              sx={{
                visibility: 'hidden',
                zIndex: 100,
                position: 'absolute',
                width: size,
                height: size,
                top: 0,
                left: 0,
                background: 'rgba(0, 0, 0, 0.05)',
                // border: '1px solid rgba(0, 0, 0, 0.5)',
                borderRadius: '4px',

                display: 'flex',
                // flexDirection: 'column',
                // justifyContent: 'flex-end',
                alignItems: 'flex-end',
              }}
            >
              <Box sx={{
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              <Typography level='body-xs' sx={{color: 'white'}}>{multiYearStr(team.attributes.seasons.map(x => x.year))}</Typography>
              <Typography level='body-xs' sx={{color: 'white'}}>{team.attributes.name}</Typography>
              </Box>
            </Box>
            <Box sx={{
              width: size,
              height: size,
            }}>
        
            <Box 
              style={{
                transform: `scale(${size / width})`,
                transformOrigin: 'left top',
              
                width: `${width}px`,
                height: `${height}px`,
                background: `url(${image}) ${-1 * x}px ${-1 * y}px`,
              }}
              />
             </Box>
             </Box>
          );
        });

        return (
          <Box key={franchise.key} sx={{p: 4}}>
            <Typography>{franchise.attributes.label}</Typography>
            <Card >
              <CardOverflow sx={{display: 'flex', flexWrap: 'wrap', flexDirection: 'row', p: 0}}>
                {teamLogos}
              </CardOverflow>
            </Card>
          </Box>
        );
      })}
    </Box>
  );
  
};

export default LogoPage;
