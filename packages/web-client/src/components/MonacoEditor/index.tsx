import React from 'react';
import { ControlledEditor as NativeMonacoEditor } from '@monaco-editor/react';

export interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
}

export const MonacoEditor = (props: MonacoEditorProps) => {

  return (
    <NativeMonacoEditor 
      language="javascript"
      value={props.value}
      height="500px"
      width="500px"
      onChange={(event, value) => value && props.onChange(value)}
    />
  );
}