import React from 'react';
import AceEditor from 'react-ace';

interface SingleEditorProps {
  value: string
  onChange?: (value: string) => void
  error?: Error | null
}

export const SingleEditor: any = (props: SingleEditorProps) => {

  return (
    <div>
      <AceEditor
        mode="javascript"
        theme="github"
        value={props.value}
        onChange={props.onChange}
        editorProps={{ $blockScrolling: true }}
        enableBasicAutocompletion
        fontSize={13}
        annotations={[
          {
            row: 3, // must be 0 based
            column: 4, // must be 0 based
            text: "error.message", // text to show in tooltip
            type: "error"
          }
        ]}
        markers = {[
          {
            startRow: 3,
            type: "text",
            className: "test-marker"
          }
        ] as any}
      />
      {props.error && (
        <>
          <h2>Error</h2>
          <p>{props.error.message}</p>
        </>
      )}
    </div>
  );
}