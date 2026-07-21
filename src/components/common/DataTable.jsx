import { Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';

function DataTable({ columns, rows, loading = false, sortField, sortDirection = 'asc', onSort, getRowId, ariaLabel = 'Data table' }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, mt: 2 }}>
      <Table aria-label={ariaLabel}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.field}>
                {column.sortable && onSort ? (
                  <TableSortLabel
                    active={sortField === (column.sortField || column.field)}
                    direction={sortField === (column.sortField || column.field) ? sortDirection : 'asc'}
                    onClick={() => onSort(column.sortField || column.field)}
                  >
                    {column.headerName}
                  </TableSortLabel>
                ) : column.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && Array.from({ length: 4 }, (_, index) => (
            <TableRow key={`loading-${index}`}>
              {columns.map((column) => (
                <TableCell key={`loading-${index}-${column.field}`}>
                  <Skeleton height={24} />
                </TableCell>
              ))}
            </TableRow>
          ))}
          {rows.map((row, index) => (
            <TableRow key={getRowId ? getRowId(row) : row.id || index} hover>
              {columns.map((column) => (
                <TableCell key={`${getRowId ? getRowId(row) : row.id || index}-${column.field}`}>
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
