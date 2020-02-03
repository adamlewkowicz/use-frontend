import React, { useRef, useEffect, ReactNode } from 'react';
import {
  ControlledEditor as NativeMonacoEditor,
  EditorDidMount,
  ControlledEditorOnChange,
  monaco,
  Monaco
} from '@monaco-editor/react';
import { NormalizedError } from '../../utils';
import css from './index.module.css';

const MARKER_NAME = 'custom_marker';

export interface MonacoEditorProps {
  value: string
  onChange?: (value: string) => void
  error?: NormalizedError | null
  options?: Partial<MonacoEditor['EditorOptions']>
  header?: ReactNode
}

export const MonacoEditor = (props: MonacoEditorProps) => {
  const editorRef = useRef<MonacoEditor>();
  const monacoRef = useRef<Monaco>();

  useEffect(() => {
    monaco
      .init()
      .then(monacoInstance => monacoRef.current = monacoInstance);
  }, []);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const model = (editorRef.current as any).getModel();

    if (props.error == null) {
      monacoRef.current.editor.setModelMarkers(
        model,
        MARKER_NAME,
        []
      );
    } else {
      const { line, column, message } = props.error;

      monacoRef.current.editor.setModelMarkers(
        model,
        MARKER_NAME,
        [
          {
            startLineNumber: line,
            startColumn: column,
            endLineNumber: line,
            endColumn: column,
            message: message,
            severity: monacoRef.current.MarkerSeverity.Error
          }
        ]
      );
    }
  }, [props.error]);

  const handleOnChange: ControlledEditorOnChange = (event, value) => {
    if (value && props.onChange) {
      props.onChange(value);
    }
  }
  
  const handleEditorDidMount: EditorDidMount = (_, editor: any) => {
    editorRef.current = editor;
  }

  return (
    <div className={css.container}>
      {props.header}
      <NativeMonacoEditor
        language="javascript"
        value={props.value}
        height="600px"
        width="40vw"
        onChange={handleOnChange}
        editorDidMount={handleEditorDidMount}
        options={props.options as any}
      />
    </div>
  );
}

type MonacoEditor = Monaco['editor'];