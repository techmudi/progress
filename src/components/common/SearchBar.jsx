import { TextField } from '@mui/material';

function SearchBar({ label = 'Search', placeholder = 'Search', value = '', onChange, disabled = false }) {
  return (
    <TextField
      size="small"
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      sx={{ width: { xs: '100%', sm: 280 } }}
    />
  );
}

export default SearchBar;
