import React from 'react';
import { FixedSizeList } from 'react-window';

import { Popper } from '@mui/base/Popper';
import AutocompleteListbox from '@mui/joy/AutocompleteListbox';

import SearchOption, { OPTION_HEIGHT, BaseSearchOptionProps, SearchOptionPlaceholder } from './SearchOption';
import { getIndex } from '../../../shared/util';

// ***
// Note: all this tomfoolery below is to make adapters between JoyUI Autocomplete and react-window
// Mostly copied modifications from https://mui.com/joy-ui/react-autocomplete/#virtualization
// ***

const LISTBOX_PADDING = 6; // px

type NoResults = {
  key: string;
  message: string;
};

const isNoResults = (item: BaseSearchOptionProps | NoResults): item is NoResults => {
  return 'message' in item;
};

export type RenderRowProps = {
  data: (BaseSearchOptionProps | NoResults)[];
  index: number;
  style: React.CSSProperties;
};

const RenderRow = ({ data, index, style }: RenderRowProps) => {
  const props = getIndex(index, data);

  const wrapperStyle = {
    ...style, 
    top: (style.top as number) + LISTBOX_PADDING
  }; 

  return isNoResults(props) 
    ?  <SearchOptionPlaceholder option={{
        message: props.message, // eslint-disable-line
        subMessage: 'If filters are applied, items may be hidden.',
        noImage: true,
      }} />
    : <SearchOption {...props} wrapperStyle={wrapperStyle} />;
};

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>(function OuterElementTypeComponent(props, ref) {
  const outerProps = React.useContext(OuterElementContext);
  return (
    <AutocompleteListbox
      {...props}
      {...outerProps}
      component="div"
      ref={ref}
      sx={{
        '& ul': {
          padding: 0,
          margin: 0,
          flexShrink: 0,
        },
      }}
    />
  );
});

// Adapter for react-window
type ListboxComponentProps = {
  anchorEl: React.ComponentProps<typeof Popper>['anchorEl'];
  open: boolean;
  modifiers: React.ComponentProps<typeof Popper>['modifiers'];
} & React.HTMLAttributes<HTMLElement>;

export const ListboxComponent = React.forwardRef<HTMLDivElement, ListboxComponentProps>(function ListboxComponent(props, ref) {
  const { children, anchorEl, open, modifiers, ...other } = props;

  const listRef = React.useRef<FixedSizeList>(null);
  const rowDataBase = getIndex(0, (children as (BaseSearchOptionProps | NoResults)[][]));
  const rowData = rowDataBase.length > 0 ? rowDataBase : [{ key: 'no-results', message: 'No results found'}];

  const getRow = (index: number): BaseSearchOptionProps | NoResults => getIndex(index, rowData);

  const getKey = (index: number): string => {
    const res = getRow(index);
    return isNoResults(res) ? res.key : res.option.key;
  };

  return (
    <Popper ref={ref} anchorEl={anchorEl} open={open} modifiers={modifiers}>
      <OuterElementContext.Provider value={other}>
        <FixedSizeList
          ref={listRef}
          itemData={rowData}
          itemKey={getKey}
          height={OPTION_HEIGHT * 8}
          width="100%"
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={OPTION_HEIGHT}
          overscanCount={5}
          itemCount={rowData.length}
        >
          {RenderRow}
        </FixedSizeList>
      </OuterElementContext.Provider>
    </Popper>
  );
});
