import React, { useState } from 'react';

import Box from '@mui/joy/Box';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import List from '@mui/joy/List';
import ListItemButton from '@mui/joy/ListItemButton';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import SearchOptionImage from './SearchOptionImage';
import { NodeAttributes } from '../../../shared/types';

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
  onSubItemSelect: (subItem: OptionSubItem) => void;
  // Note: this is a hacky way to pass props to the underlying AutocompleteOption props
  autocompleteOptionProps: any; // eslint-disable-line
};

const SearchOption = ({option, onSubItemSelect, autocompleteOptionProps}: SearchOptionProps) => {
  const [showSubItems, setShowSubItems] = useState(false);

  return (
    <Box>
      <AutocompleteOption {...autocompleteOptionProps} >
        <ListItemDecorator>
          <Box sx={{ width: '40px', height: '40px'}}>
            <SearchOptionImage option={option}/>
          </Box>
        </ListItemDecorator>
        <ListItemContent sx={{ fontSize: 'md', ml: 1 }}>
          {option.label}
          <Typography level="body-xs">{option.subLabel}</Typography>
        </ListItemContent>
        {option.subItems && 
          <IconButton
            variant="plain"
            color='primary'
            size="sm"
            sx={{borderRadius: '50%'}}
            onClick={(e) => {
              e.stopPropagation();
              setShowSubItems(!showSubItems);
            }}
          >
            {showSubItems ? <KeyboardDoubleArrowUpIcon /> : <KeyboardDoubleArrowDownIcon />}
          </IconButton>
        }
      </AutocompleteOption>
      {option.subItems && showSubItems 
        ? <Box sx={{ml: 4, borderLeft: '2px solid #DDD'}}>
            <List sx={{pl: 1, pr: 2}} size="sm">
              {option.subItems.map((subItem) => (
                <ListItemButton sx={{"--ListItem-paddingY": "0px", "--ListDivider-gap": "0px"}} key={subItem.key} onClick={() => onSubItemSelect(subItem)}>
                  <Box sx={{width: 60, flexShrink: 0}}>
                    <Typography level="body-xs">{subItem.subLabel}</Typography>
                  </Box>
                  <Typography noWrap level="body-xs">{subItem.label}</Typography>
                </ListItemButton>
              ))}
            </List>
          </Box> 
        : null
      }
    </Box>
  );
};

export default SearchOption;
