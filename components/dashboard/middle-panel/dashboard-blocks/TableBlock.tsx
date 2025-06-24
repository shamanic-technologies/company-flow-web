import React from 'react';
import { Card, Title, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';

interface TableBlockProps {
  title: string;
  data: any[];
}

export const TableBlock: React.FC<TableBlockProps> = ({ title, data }) => {
  // Extract headers from the first data item if data is an array of objects
  const headers = data && Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' 
    ? Object.keys(data[0]) 
    : [];

  return (
    <Card className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm">
      <Title className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4">
        {title}
      </Title>
      {headers.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableHeaderCell key={index} className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header, cellIndex) => (
                  <TableCell key={cellIndex} className="text-xs text-gray-900 dark:text-gray-50">
                    {row[header]?.toString() || '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
}; 