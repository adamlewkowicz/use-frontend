import { NormalizedError } from '../common/utils';
import React, { useRef, useEffect, useState } from 'react';
import {
  ControlledEditor as NativeMonacoEditor,
  EditorDidMount,
  ControlledEditorOnChange,
  monaco,
  Monaco,
} from '@monaco-editor/react';

const MARKER_NAME = 'custom_marker';

interface UseMonacoEditorOptions {
  onChange?: (value: string) => void
}

export const useMonacoEditor = (options: UseMonacoEditorOptions = {}) => {
  const editorRef = useRef<MonacoEditor>();
  const monacoRef = useRef<Monaco>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    monaco
      .init()
      .then(monacoInstance => monacoRef.current = monacoInstance)
      .finally(() => setIsLoading(false));
  }, []);

  const handleOnChange: ControlledEditorOnChange = (event, value) => {
    if (value && options.onChange) {
      options.onChange(value);
    }
  }
  
  const handleEditorDidMount: EditorDidMount = (_, editor: any) => {
    editorRef.current = editor;
  }

  const setError = (error: NormalizedError | null): void => {
    if (!monacoRef.current || !editorRef.current) return;
    const model = (editorRef.current as any).getModel();

    if (error == null) {
      monacoRef.current.editor.setModelMarkers(
        model,
        MARKER_NAME,
        []
      );
    } else {
      const { line, column, message } = error;

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
  }

  const MonacoEditor = (
    <NativeMonacoEditor
      language="javascript"
      height="500px"
      width="500px"
      onChange={handleOnChange}
      editorDidMount={handleEditorDidMount}
    />
  );

  return {
    isLoading,
    setError,
    editorRef,
    monacoRef,
    MonacoEditor,
  }
}

type MonacoEditor = Monaco['editor'];