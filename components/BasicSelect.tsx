import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

type Props<T extends string> = {
  options: {
    value: T;
    label: string;
  }[];
  optionsTypeLabel: string;
  value: T;
  onChange: (value: T) => void;
};

export default function BasicSelect<T extends string>({
  options,
  optionsTypeLabel,
  value,
  onChange,
}: Props<T>) {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as T);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 100 }}>
      <InputLabel>{optionsTypeLabel}</InputLabel>
      <Select value={value} label={optionsTypeLabel} onChange={handleChange}>
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
