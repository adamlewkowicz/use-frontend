import React, { useMemo } from 'react';
import NativeReactDiffViewer from 'react-diff-viewer';
import { prettierFormat } from '../utils';

const ReactDiffViewer = NativeReactDiffViewer as unknown as ReactDiffViewer;

interface DiffViewerProps {
  oldValue: string
  newValue: string
}

export const DiffViewer = (props: DiffViewerProps) => {
  // const oldValue = useMemo(() => prettierFormat(props.oldValue), [props.oldValue])

  return (
    <ReactDiffViewer
      oldValue={props.oldValue}
      newValue={props.newValue}
      splitView
    >
    </ReactDiffViewer>
  );
}

type ReactDiffViewer = React.FC<ReactDiffViewerProps>;

interface ReactDiffViewerProps {
  oldValue: string
  newValue: string
  splitView?: boolean
}