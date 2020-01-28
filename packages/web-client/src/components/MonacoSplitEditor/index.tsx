import React from 'react';
import { MonacoEditor, MonacoEditorProps } from '../MonacoEditor';
import css from './index.module.css';

interface MonacoSplitEditorProps<T extends readonly string[]> {
  values?: T
  onChange?: (values: T) => void
  editors: MonacoEditorProps[]
}

export const MonacoSplitEditor = <T extends readonly string[]>(props: MonacoSplitEditorProps<T>) => {

  return (
    <div className={css.container}>
      {props.editors.map((editorProps, index) => (
        <MonacoEditor
          key={index}
          {...editorProps}
        />
      ))}
    </div>
  );
}