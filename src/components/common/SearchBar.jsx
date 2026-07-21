import { TextField } from '@mui/material';

function SearchBar({ placeholder = 'Search' }) {
  return <TextField size="small" placeholder={placeholder} sx={{ width: 280 }} />;
}

export default SearchBar;
