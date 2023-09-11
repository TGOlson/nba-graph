import React from 'react';

import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import Checkbox from '@mui/joy/Checkbox';

import { GraphFilters } from '../util/types';
import { Slider } from '@mui/joy';

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
    boxShadow: 'none'
  };

  return (
    <Card variant='outlined' sx={sx}>
      <Typography level="title-lg">NBA Graph</Typography>
      <Typography level="body-sm">Years</Typography>
      <Slider 
        size="sm"
        track={false}
        defaultValue={[0, 100]}
        marks={[
          {
            value: 0,
            label: '0°C',
          },
          {
            value: 100,
            label: '100°C',
          },
        ]}
        valueLabelDisplay="on"
      />
      <Typography level="body-sm">Filters</Typography>
      <Checkbox size="sm" label="Show awards" checked={filters.showAwards} onChange={() => onFilterChange({showAwards: !filters.showAwards})} />
      <Checkbox size="sm" label="Show short career players" checked={filters.showShortCareerPlayers} onChange={() => onFilterChange({showShortCareerPlayers: !filters.showShortCareerPlayers})} />
      <Typography level="body-sm">Leagues</Typography>
      <Checkbox size="sm" label="NBA" checked={filters.showNBA} onChange={() => onFilterChange({showNBA: !filters.showNBA})} />
      <Checkbox size="sm" label="ABA" checked={filters.showABA} onChange={() => onFilterChange({showABA: !filters.showABA})} />
      <Checkbox size="sm" label="BAA" checked={filters.showBAA} onChange={() => onFilterChange({showBAA: !filters.showBAA})} />
    </Card>
  );
};

export default GraphFilters;
