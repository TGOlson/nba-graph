import React from 'react';

import Box from '@mui/joy/Box';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import SearchOptionImage from './SearchOptionImage';
import { NodeAttributes } from '../../../shared/types';

export const OPTION_HEIGHT = 58; // px
export const OPTION_SUBITEM_HEIGHT = 32; // px

export type Option = {
  key: string;
  label: string;
  subLabel: string;
  searchString: string;
  subItems?: OptionSubItem[];
  attrs: NodeAttributes;
};

export type OptionSubItem = {
  key: string;
  label: string;
  subLabel: string;
};

export type SearchOptionProps = {
  option: Option;
  expanded: boolean,
  setExpanded: (expanded: boolean) => void,
  onSubItemSelect: (subItem: OptionSubItem) => void,
  wrapperStyle: React.CSSProperties & {top: number},
  autocompleteOptionProps: Omit<React.HTMLAttributes<HTMLLIElement>, 'color'>, 
};

const SearchOption = (props: SearchOptionProps) => {
  const {
    option, 
    expanded, 
    setExpanded, 
    onSubItemSelect, 
    wrapperStyle,
    autocompleteOptionProps
  } = props;

  return (
    <Box>
      <ListItem 
        {...autocompleteOptionProps} 
        style={{...wrapperStyle, height: OPTION_HEIGHT}} 
        slots={{root: AutocompleteOption}} 
        endAction={option.subItems 
          ? <IconButton
            variant="plain"
            color='primary'
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <KeyboardDoubleArrowUpIcon /> : <KeyboardDoubleArrowDownIcon />}
          </IconButton>
          : null 
        }
      >
        <ListItemDecorator>
          <Box sx={{ width: '40px', height: '40px'}}>
            <SearchOptionImage option={option}/>
          </Box>
        </ListItemDecorator>
        <ListItemContent sx={{ fontSize: option.label.length > 25 ? 'sm' : 'md', ml: 1, width: '100%' }}>
          <Typography level='inherit' noWrap>{option.label}</Typography>
          <Typography level="body-xs">{option.subLabel}</Typography>
        </ListItemContent>
      </ListItem>
      {option.subItems && expanded ? <Box sx={{
        ml: 4, 
        width: '250px', // 300 search bar - 32 margin left - 18 margin right
        borderLeft: '2px solid #DDD', 
        position: wrapperStyle.position, 
        top: wrapperStyle.top + OPTION_HEIGHT
        }}>
        <List sx={{pl: 1, pr: 2}} size="sm">
          {option.subItems.map((subItem) => (
            <ListItem sx={{"--ListItem-paddingY": "0px", "--ListDivider-gap": "0px"}} key={subItem.key}>
              <ListItemButton onClick={() => onSubItemSelect(subItem)}>
                <Box sx={{width: 60, flexShrink: 0}}>
                  <Typography level="body-xs">{subItem.subLabel}</Typography>
                </Box>
                <Typography noWrap level="body-xs">{subItem.label}</Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box> : null}
    </Box>
  );
};

export default SearchOption;
