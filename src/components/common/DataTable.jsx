import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

function DataTable({ columns, rows }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.field}>{column.headerName}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.id || index} hover>
              {columns.map((column) => (
                <TableCell key={`${row.id || index}-${column.field}`}>
                  {column.render ? column.render(row[column.field], row) : row[column.field]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;
