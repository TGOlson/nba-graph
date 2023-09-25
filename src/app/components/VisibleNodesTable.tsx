import React from 'react';

import Table from '@mui/joy/Table';

type VisibleNodeTableProps = {
  nodeCounts: {[key: string]: {visible: number, total: number}};
};

const capitalizeFirstLetter = (string: string): string =>
  string.charAt(0).toUpperCase() + string.slice(1);

const VisibleNodeTable = ({nodeCounts}: VisibleNodeTableProps) => {
  return (
    <Table 
      size="sm" 
      borderAxis='none'
      sx={{
        width: '210px',
        ml: 1,
        "--TableCell-height": "20px",
        "--TableCell-paddingY": "0px",
      }}
    >
      <tbody>
        {Object.entries(nodeCounts).map(([key, {visible, total}]) => (
          <tr key={key}>
            <td style={{width: '80px'}}>{capitalizeFirstLetter(key)}</td>
            <td style={{width: '40px', textAlign: 'right'}}>{visible}</td>
            <td style={{width: '90px', textAlign: 'right'}}>({total} total)</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default VisibleNodeTable;
