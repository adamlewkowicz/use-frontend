import React, { ReactNode } from 'react';
import {
  FormControl,
  InputLabel,
  Select as MaterialSelect,
  makeStyles,
  SelectProps as MaterialSelectProps
} from '@material-ui/core';

interface SelectProps<T extends object> extends MaterialSelectProps {
  title: string
  value?: unknown
  options: readonly T[]
  renderOption: (v: T) => ReactNode
}

export function Select<T extends object>(props: SelectProps<T>) {
  const styles = useStyles();
  const {
    title,
    value,
    options,
    renderOption,
    ...selectProps
  } = props;

  return (
    <FormControl variant="filled">
      <InputLabel>{title}</InputLabel>
      <MaterialSelect
        value={value}
        className={styles.select}
        {...selectProps}
      >
        {options.map(renderOption)}
      </MaterialSelect>
    </FormControl>
  );
}

const useStyles = makeStyles(theme => ({
  select: {
    background: '#fff',
    '&$focused': {
      color:'#000000'
    }
  }
}));