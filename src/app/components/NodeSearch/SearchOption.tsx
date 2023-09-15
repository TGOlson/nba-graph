import React, { useState } from 'react';

import Box from '@mui/joy/Box';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Typography from '@mui/joy/Typography';
import Link from '@mui/joy/Link';
import Table from '@mui/joy/Table';
import IconButton from '@mui/joy/IconButton';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

import SearchOptionImage from './SearchOptionImage';
import { NodeAttributes } from '../../../shared/types';

export type Option = {
  key: string;
  label: string;
  subLabel: string;
  // searchString: string; // TODO: useful?
  subItems?: {key: string, label: string}[];
  attrs: NodeAttributes;
};

type SearchOptionProps = {
  option: Option;
  onSubItemSelect: (id: string) => void;
  // Note: this is a hacky way to pass props to the underlying AutocompleteOption props
  autocompleteOptionProps: any; // eslint-disable-line
};

function chunks<T>(arr: T[], size: number): T[][] {
  const res = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}

type SubItemTableProps = {
  subItems: {key: string, label: string}[];
  onSelect: (id: string) => void;
};

const SubItemTable = ({subItems, onSelect}: SubItemTableProps) => {
  const rows = chunks(subItems, 3).map((chunk, i) => (
    <tr key={i}>{chunk.map((subItem) => (
      <td key={subItem.key}>
        <Link
          color="neutral"
          level="body-xs"
          underline="hover"
          variant="plain"
          onClick={() => onSelect(subItem.key)}
        >
          {subItem.label}
        </Link>
      </td>
    ))}
    </tr>
  ));

  return (
    <Box sx={{ml: 4, borderLeft: '2px solid #CCCCCC'}}>
      <Table 
        borderAxis='none' 
        sx={{"--TableCell-paddingY": "2px", "--TableCell-height": "20px", pl: 1, pr: 2}}
      >
        <tbody>{rows}</tbody>
      </Table>
    </Box>
  );
};

const SearchOption = ({option, onSubItemSelect, autocompleteOptionProps}: SearchOptionProps) => {
  const [showSubItems, setShowSubItems] = useState(false);

  return (
    <Box key={option.key}>
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
          variant="outlined"
          color='primary'
          size="sm"
          sx={{borderRadius: '50%'}}
          onClick={(e) => {
            setShowSubItems(!showSubItems);
            e.stopPropagation();
          }}
        >
          {showSubItems ? <KeyboardDoubleArrowUpIcon /> : <KeyboardDoubleArrowDownIcon />}
        </IconButton>
      }
      </AutocompleteOption>
      {option.subItems && showSubItems ? <SubItemTable subItems={option.subItems} onSelect={onSubItemSelect} /> : null}
    </Box>
  );
};

export default SearchOption;
