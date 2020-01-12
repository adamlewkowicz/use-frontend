import React from 'react';
import AceEditor from 'react-ace';

interface SingleEditorProps {
  value: string
  onChange?: (value: string) => void
  error?: Error | null
}

export const SingleEditor = (props: SingleEditorProps) => {

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
      />
    </div>
  );
}