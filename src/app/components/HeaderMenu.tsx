import React, { useState } from 'react';

import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import Checkbox from '@mui/joy/Checkbox';

import { GraphFilters } from '../util/types';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import Input from '@mui/joy/Input';
import Slider from '@mui/joy/Slider';

type HeaderProps = {
  filters: GraphFilters;
  onFilterChange: (change: Partial<GraphFilters>) => void;
};

export const DEFAULT_FILTERS: GraphFilters = {
  showAwards: true,
  showShortCareerPlayers: true,
  showNBA: true,
  showABA: true,
  showBAA: true,
  minYear: 1947,
  maxYear: 2023,
};

const leagueLabel = (league: string, years: string): React.ReactNode => {
  return (
    <React.Fragment>
      <Typography>{league}</Typography>
      <Typography level="body-xs" sx={{ml: 0.5}}>{years}</Typography>
    </React.Fragment>
  );
};

const GraphFilters = ({filters, onFilterChange}: HeaderProps) => {
  const [minYear, setMinYear] = useState<number>(filters.minYear);
  const [maxYear, setMaxYear] = useState<number>(filters.maxYear);

  const sx = {
    top: 0,
    m: 1,
    ml: 2,
    mr: 2,
    position: 'absolute', 
    zIndex: 1000,
    "--Card-radius": "6px",
    width: 300,
    boxShadow: 'none'
  };

  return (
    <Card variant='outlined' sx={sx}>
      <Typography level="title-lg">NBA Graph</Typography>
      <Divider inset="none" />
      <Typography level="body-sm">Years</Typography>
      <Box sx={{display: 'flex'}}>
        <Input 
          size="sm" 
          sx={{width: 70}} 
          value={isNaN(minYear) ? '' : minYear} 
          onChange={(e) => setMinYear(parseInt(e.target.value))}
          onBlur={(e) => {
            let year = parseInt(e.target.value);

            if (year > maxYear) year = maxYear;
            if (year < DEFAULT_FILTERS.minYear) year = DEFAULT_FILTERS.minYear;
            if (isNaN(year)) year = DEFAULT_FILTERS.minYear;

            setMinYear(year);
            onFilterChange({minYear: year});
          }}
        />
        <Divider sx={{width: 12, mt: 2, mr: 1, ml: 1}} />
        <Input 
          size="sm" 
          sx={{width: 70}} 
          value={isNaN(maxYear) ? '' : maxYear} 
          onChange={(e) => setMaxYear(parseInt(e.target.value))}
          onBlur={(e) => {
            let year = parseInt(e.target.value);

            if (year < minYear) year = minYear;
            if (year > DEFAULT_FILTERS.maxYear) year = DEFAULT_FILTERS.maxYear;
            if (isNaN(year)) year = DEFAULT_FILTERS.maxYear;

            setMaxYear(year);
            onFilterChange({maxYear: year});
          }}
        />
      </Box>
      <Box sx={{pl: 1, pr: 1, mb: -1, mt: -1}}>
        <Slider 
          size="sm"
          sx={{pl: 2, pr: 2}}
          min={DEFAULT_FILTERS.minYear}
          max={DEFAULT_FILTERS.maxYear}
          value={[filters.minYear, filters.maxYear]}
          onChange={(_e, value) => {
            if (typeof value === 'number') throw new Error(`Unexpected slider value: ${value}`);
            const minYear = value[0] as number;
            const maxYear = value[1] as number;
            
            setMinYear(minYear);
            setMaxYear(maxYear);
            onFilterChange({minYear, maxYear});
          }}
          valueLabelDisplay="off"
        />
      </Box>
      <Typography level="body-sm">Leagues</Typography>
      <Checkbox 
        size="sm" 
        sx={{mb: '-4px'}}
        label={leagueLabel('NBA', '1950-present')} 
        checked={filters.showNBA} 
        onChange={() => onFilterChange({showNBA: !filters.showNBA})} 
      />
      <Checkbox 
        size="sm" 
        sx={{mb: '-4px'}}
        label={leagueLabel('ABA', '1968-1976')} 
        checked={filters.showABA} 
        onChange={() => onFilterChange({showABA: !filters.showABA})} 
      />
      <Checkbox 
        size="sm" 
        sx={{mb: '-4px'}}
        label={leagueLabel('BAA', '1947-1949')} 
        checked={filters.showBAA} 
        onChange={() => onFilterChange({showBAA: !filters.showBAA})} 
      />
      <Typography level="body-sm" sx={{mt: 1}}>Misc.</Typography>
      <Checkbox size="sm" label="Awards" checked={filters.showAwards} onChange={() => onFilterChange({showAwards: !filters.showAwards})} />
      <Checkbox size="sm" label="Short career players" checked={filters.showShortCareerPlayers} onChange={() => onFilterChange({showShortCareerPlayers: !filters.showShortCareerPlayers})} />
    </Card>
  );
};

export default GraphFilters;
