import React, { useState, useEffect } from 'react';
import { SingleEditor } from '../SingleEditor';
import { hooksToCompositionPlugin } from 'babel-plugin-hooks-to-composition';
import { useBabel } from '../../hooks/use-babel';
import { defaultCode } from '../../App';
import css from './index.module.css';

const babelPlugins = [
  hooksToCompositionPlugin,
];

interface SplitEditorProps {}

export const SplitEditor = (props: SplitEditorProps) => {
  const [reactCode, setReactCode] = useState<string>(
    () => localStorage.getItem('r_code') || defaultCode
  );
  const {
    transform: transformReactCode,
    error: vueError,
    code: vueCode,
  } = useBabel(babelPlugins);

  const handleReactCodeChange = (reactCode: string) => {
    setReactCode(reactCode);
    transformReactCode(reactCode);
    localStorage.setItem('r_code', reactCode);
  }

  // TODO: remove; temp workaround
  useEffect(() => {
    transformReactCode(reactCode);
  }, []);

  return (
    <div className={css.container}>
      <SingleEditor
        value={reactCode}
        onChange={handleReactCodeChange}
        error={vueError}
      />
      <SingleEditor
        value={vueCode}
        error={vueError}
      />
    </div>
  );
}