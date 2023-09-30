import React, { useState } from 'react';

import Typography from '@mui/joy/Typography';
import Checkbox from '@mui/joy/Checkbox';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import Input from '@mui/joy/Input';
import Slider from '@mui/joy/Slider';
import Tooltip from '@mui/joy/Tooltip';
import Drawer from '@mui/joy/Drawer';
import ModalClose from '@mui/joy/ModalClose';
import Link from '@mui/joy/Link';

import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DialogContent from '@mui/joy/DialogContent';

import NodeCountTable from './NodeCountTable';
import { SearchOptionPlaceholder } from './NodeSearch/SearchOption';
import Logo from './Logo';

import { GraphFilters } from '../util/types';
import { getProp } from '../../shared/util';
import { NBAGraphNode } from '../../shared/types';
import ContactLinks from './ContactLinks';

type SidePanelProps = {
  filters: GraphFilters;
  selectedNode: NBAGraphNode | null;
  nodeCounts: {[key: string]: {visible: number, total: number}};
  onFilterChange: (change: Partial<GraphFilters>) => void;
};

export const DEFAULT_FILTERS: GraphFilters = {
  awards: true,
  shortCareerPlayers: true,
  leagues: {
    NBA: true,
    ABA: true,
    BAA: true,
  },
  minYear: 1947,
  maxYear: 2023,
};

const leagueLabel = (league: string, years: string): React.ReactNode => {
  return (
    <React.Fragment>
      <Typography sx={{width: 30}}>{league}</Typography>
      <Typography level="body-xs" sx={{ml: 0.5}}>{years}</Typography>
    </React.Fragment>
  );
};

const YearFilters = ({filters, onFilterChange}: Pick<SidePanelProps, 'filters' | 'onFilterChange'>) => {
  const [minYear, setMinYear] = useState(filters.minYear);
  const [maxYear, setMaxYear] = useState(filters.maxYear);

  return (
    <React.Fragment>
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Typography level="body-sm">Years</Typography>
        <Tooltip 
          size='sm' 
          arrow 
          sx={{ml: '4px'}}
          title={<Typography level='inherit' sx={{width: '250px'}}>Basketball reference league year (eg. 2023 is the 2022-23 NBA season)</Typography>}
          placement='right'
          enterDelay={0}
        >
          <InfoOutlinedIcon fontSize='small' />
        </Tooltip>
      </Box>
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
    </React.Fragment>
  );
};

const SelectedNodeLink = ({selectedNode}: Pick<SidePanelProps, 'selectedNode'>) => {
  const previewOption = selectedNode 
    ? {key: selectedNode.key, searchString: '', attrs: selectedNode.attributes}
    : {message: 'Nothing selected', subMessage: 'Click the graph to get started!'};
  
  const href = selectedNode 
    ? `https://www.basketball-reference.com${selectedNode.attributes.url}` 
    : undefined;

  return (
    <Box>
      <Typography level="body-sm" sx={{mb: 1}}>Selected node</Typography>
      <Box className="select-node-preview" sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <SearchOptionPlaceholder option={previewOption} />
        <Link href={href} disabled={!selectedNode} target='_blank' rel="noreferrer">
          <IconButton disabled={!selectedNode} size='sm' color='primary'>
            <OpenInNewIcon />
          </IconButton>
        </Link>
      </Box>
    </Box>
  );
};

const SidePanel = ({filters, nodeCounts, selectedNode, onFilterChange}: SidePanelProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <React.Fragment>
      <Box sx={{top: 0, m: 1, position: 'absolute'}}>
        <IconButton variant="outlined" size='lg' color="neutral" sx={{backgroundColor: '#ffffff'}} onClick={() => setDrawerOpen(true)}>
          <MenuIcon />
        </IconButton>
      </Box>
      <Drawer 
        variant="plain"
        open={drawerOpen} 
        disableEnforceFocus
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 'fit-content',
        }}
        slotProps={{
          backdrop: {sx: {display: {sm: 'none'}}},
          content: {sx: {maxWidth: '320px'}}
        }}
      >
        <Box sx={{p: 2, pb: 0}}>
          <Logo fontSize={24} />
          <ModalClose />
        </Box>
        <DialogContent sx={{gap: 1.5, p: 2}}>
          <Divider inset='none' sx={{mb: 1}}/>
          <SelectedNodeLink selectedNode={selectedNode} />
          <Divider inset='none' sx={{mb: 1}} />
          <YearFilters filters={filters} onFilterChange={onFilterChange} />
          <Typography level="body-sm">Leagues</Typography>
          {/* TODO: would be better to get a list of leagues and programattically generate this */}
          {([
            ['NBA', '1950-2023'],
            ['ABA', '1968-1976'],
            ['BAA', '1947-1949'],
          ] as [string, string][]).map(([league, years]) => (
            <Checkbox 
              key={league}
              size="sm" 
              sx={{mb: '-4px'}}
              label={leagueLabel(league, years)} 
              checked={getProp(league, filters.leagues)} 
              onChange={(e) => onFilterChange({leagues: {...filters.leagues, [league]: e.target.checked}})} 
            />
          ))}
          <Typography level="body-sm" sx={{mt: 2}}>Misc.</Typography>
          <Checkbox size="sm" label="Awards" checked={filters.awards} onChange={() => onFilterChange({awards: !filters.awards})} />
          <Checkbox size="sm" label="Short career players" checked={filters.shortCareerPlayers} onChange={() => onFilterChange({shortCareerPlayers: !filters.shortCareerPlayers})} />
          <Divider inset='none' sx={{mt: 2, mb: 1}}/>
          <Typography level="body-sm">Visible nodes</Typography>
          <NodeCountTable nodeCounts={nodeCounts} />
          <Divider inset='none' sx={{mt: 1, mb: 0.5}}/>
          <ContactLinks />
        </DialogContent>
      </Drawer>
    </React.Fragment>
  );
};

export default SidePanel;
