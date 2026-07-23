import { Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';

function DataTable({
  columns = [],
  rows,
  data,
  loading = false,
  sortField,
  sortDirection = 'asc',
  onSort,
  getRowId,
  renderActions,
  ariaLabel = 'Data table',
}) {
  // `data` and `{ key, label }` are supported for the older task page while
  // the rest of the app uses `rows` and `{ field, headerName }`.
  const tableRows = rows || data || [];
  const getColumnField = (column) => column.field || column.key;
  const getRowKey = (row, index) => getRowId ? getRowId(row) : row.id || index;

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2, mt: 2 }}>
      <Table aria-label={ariaLabel}>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => {
              const field = getColumnField(column);

              return (
              <TableCell key={field || `column-${index}`}>
                {column.sortable && onSort ? (
                  <TableSortLabel
                    active={sortField === (column.sortField || field)}
                    direction={sortField === (column.sortField || field) ? sortDirection : 'asc'}
                    onClick={() => onSort(column.sortField || field)}
                  >
                    {column.headerName || column.label}
                  </TableSortLabel>
                ) : (column.headerName || column.label)}
              </TableCell>
              );
            })}
            {renderActions && <TableCell key="actions">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && Array.from({ length: 4 }, (_, index) => (
            <TableRow key={`loading-${index}`}>
              {columns.map((column, columnIndex) => (
                <TableCell key={`loading-${index}-${getColumnField(column) || columnIndex}`}>
                  <Skeleton height={24} />
                </TableCell>
              ))}
              {renderActions && <TableCell key={`loading-${index}-actions`}><Skeleton height={24} /></TableCell>}
            </TableRow>
          ))}
          {tableRows.map((row, index) => {
            const rowKey = getRowKey(row, index);

            return (
            <TableRow key={rowKey} hover>
              {columns.map((column, columnIndex) => {
                const field = getColumnField(column);

                return (
                <TableCell key={`${rowKey}-${field || columnIndex}`}>
                  {column.render ? column.render(row[field], row) : row[field]}
                </TableCell>
                );
              })}
              {renderActions && <TableCell key={`${rowKey}-actions`}>{renderActions(row)}</TableCell>}
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;
