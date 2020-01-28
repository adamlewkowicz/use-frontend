import React from 'react';
import { SingleEditor } from '../SingleEditor';
import css from './index.module.css';
import { useReactToVue } from '../../hooks/use-react-to-vue';
import { NormalizedError } from '../../utils';

interface SplitEditorProps {
  reactCode: string
  reactError: NormalizedError | null
  setReactCode: (code: string) => void
  vueCode: string
  vueError?: NormalizedError
  setVueCode?: (code: string) => void
}

export const SplitEditor = (props: SplitEditorProps) => {
  // const {
  //   reactCode,
  //   setReactCode,
  //   reactError,
  //   vueCode,
  // } = useReactToVue();
  const reactAnnotations = props.reactError ? [props.reactError] : [];

  return (
    <div className={css.container}>
      <SingleEditor
        value={props.reactCode}
        onChange={props.setReactCode}
        error={props.reactError}
        annotations={[
          {
            row: 3, // must be 0 based
            column: 4, // must be 0 based
            text: "error.message", // text to show in tooltip
            type: "error"
          },
        ]}
      />
      <SingleEditor
        value={props.vueCode}
        error={null}
      />
    </div>
  );
}