import React, { ReactNode } from 'react';
import {
  FormControl,
  InputLabel,
  Select as MaterialSelect,
  makeStyles,
  SelectProps as MaterialSelectProps
} from '@material-ui/core';

interface SelectProps<T> extends MaterialSelectProps {
  title: string
  value?: unknown
  options: readonly T[]
  renderOption: (v: T) => ReactNode
}

export function Select<T>(props: SelectProps<T>) {
  const styles = useStyles();
  const {
    title,
    value,
    options,
    renderOption,
    ...selectProps
  } = props;

  return (
    <FormControl variant="filled" className={styles.form}>
      <InputLabel>{title}</InputLabel>
      <MaterialSelect
        value={value}
        {...selectProps}
      >
        {options.map(renderOption)}
      </MaterialSelect>
    </FormControl>
  );
}

const useStyles = makeStyles(theme => ({
  form: {
    background: '#fff',
    borderRadius: theme.shape.borderRadius,
  }
}));