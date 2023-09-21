import * as React from 'react';
import { FixedSizeList, ListChildComponentProps, areEqual } from 'react-window';

import { Popper } from '@mui/base/Popper';
import AutocompleteListbox from '@mui/joy/AutocompleteListbox';

import SearchOption, { Option, OptionSubItem } from './SearchOption';
import { AutocompleteOption } from '@mui/joy';

// ***
// Note: all this tom-foolerly below is to make adapters between JoyUI and react-window
// Mostly all copied w/ slight modification from https://mui.com/joy-ui/react-autocomplete/#virtualization
// ***

const LISTBOX_PADDING = 6; // px

export type RenderRowProps = {
  data: [
    Omit<React.HTMLAttributes<HTMLLIElement>, 'color'>, 
    Option, 
    (subItem: OptionSubItem) => void
  ][];
  index: number;
  style: React.CSSProperties;
};

const RenderRow = ({ data, index, style }: RenderRowProps) => {
  const [props, option, onSubItemSelect] = data[index] as RenderRowProps['data'][0];

  const autocompleteOptionProps = {
    ...props,
    style: {...style, top: (style.top as number) + LISTBOX_PADDING},
  };

  return (
    <SearchOption
      key={option.key}
      option={option}
      autocompleteOptionProps={autocompleteOptionProps}
      onSubItemSelect={onSubItemSelect}
    />
  );
};

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>(function JoyUIAutocompleteListbox(props, ref) {
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
export const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  {
    anchorEl: any;
    open: boolean;
    modifiers: any[];
  } & React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, anchorEl, open, modifiers, ...other } = props;
  const itemData: Array<any> = [];
  (
    children as [Array<{ children: Array<React.ReactElement> | undefined }>]
  )[0].forEach((item) => {
    if (item) {
      itemData.push(item);
      itemData.push(...(item.children || []));
    }
  });

  const itemCount = itemData.length;
  const itemSize = 58;

  return (
    <Popper ref={ref} anchorEl={anchorEl} open={open} modifiers={modifiers}>
      <OuterElementContext.Provider value={other}>
        <FixedSizeList
          itemData={itemData}
          itemKey={index => itemData[index][1].key}
          height={itemSize * 8}
          width="100%"
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={itemSize}
          overscanCount={5}
          itemCount={itemCount}
        >
          {RenderRow}
        </FixedSizeList>
      </OuterElementContext.Provider>
    </Popper>
  );
});
