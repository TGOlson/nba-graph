import React from 'react';

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

const GraphFilters = ({filters, onFilterChange}: HeaderProps) => {

  const sx = {
    top: 0,
    m: 1,
    ml: 2,
    mr: 2,
    position: 'absolute', 
    // width: '100vw', 
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
        <Input size="sm" sx={{width: 80}} value={filters.minYear} onChange={(e) => onFilterChange({minYear: parseInt(e.target.value)})} />
        <Divider sx={{width: 16, mt: 2, mr: 1, ml: 1}} />
        <Input size="sm" sx={{width: 80}} value={filters.maxYear} onChange={(e) => onFilterChange({maxYear: parseInt(e.target.value)})} />
      </Box>
      <Slider 
        size="sm"
        sx={{pl: 2, pr: 2}}
        min={1946}
        max={2023}
        value={[filters.minYear, filters.maxYear]}
        onChange={(_e, value) => {
          if (typeof value === 'number') throw new Error(`Unexpected slider value: ${value}`);
          onFilterChange({minYear: value[0], maxYear: value[1]});
        }}
        valueLabelDisplay="off"
      />
      <Typography level="body-sm">Leagues</Typography>
      <Checkbox size="sm" label="NBA (1946-present)" checked={filters.showNBA} onChange={() => onFilterChange({showNBA: !filters.showNBA})} />
      <Checkbox size="sm" label="ABA (1967-1976)" checked={filters.showABA} onChange={() => onFilterChange({showABA: !filters.showABA})} />
      <Checkbox size="sm" label="BAA (1946-1949)" checked={filters.showBAA} onChange={() => onFilterChange({showBAA: !filters.showBAA})} />
      <Typography level="body-sm">Misc.</Typography>
      <Checkbox size="sm" label="Show awards" checked={filters.showAwards} onChange={() => onFilterChange({showAwards: !filters.showAwards})} />
      <Checkbox size="sm" label="Show short career players" checked={filters.showShortCareerPlayers} onChange={() => onFilterChange({showShortCareerPlayers: !filters.showShortCareerPlayers})} />
    </Card>
  );
};

export default GraphFilters;
