import { Button, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';

const pageSizes = [10, 15, 25, 50, 100];

function ServerPagination({ meta, disabled = false, onPageChange, onPerPageChange }) {
  const currentPage = meta?.current_page || 1;
  const lastPage = meta?.last_page || 1;
  const perPage = meta?.per_page || 15;
  const total = meta?.total || 0;

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'stretch', md: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mt: 2 }}
    >
      <Typography variant="body2" color="text.secondary">
        Page {currentPage} of {lastPage} · {total} total records
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          Rows
        </Typography>
        <FormControl size="small">
          <Select
            aria-label="Rows per page"
            value={perPage}
            onChange={(event) => onPerPageChange(Number(event.target.value))}
            disabled={disabled}
          >
            {pageSizes.map((size) => (
              <MenuItem key={size} value={size}>{size}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage >= lastPage}
        >
          Next
        </Button>
      </Stack>
    </Stack>
  );
}

export default ServerPagination;
