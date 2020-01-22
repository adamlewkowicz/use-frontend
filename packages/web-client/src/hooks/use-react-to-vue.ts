import { useBabel } from './use-babel';
import { hooksToCompositionPlugin } from 'babel-plugin-hooks-to-composition';
import { useState, useEffect } from 'react';
import { defaultCode } from '../examples';
import { prettierFormat } from '../utils';

const STORAGE_KEY = 'react_code' as const;

export const useReactToVue = () => {
  const [reactCode, setReactCode] = useState<string>(
    () => prettierFormat(
      localStorage.getItem(STORAGE_KEY) || defaultCode
    )
  );
  
  const {
    transform: transformReactCode,
    error: vueError,
    code: vueCode,
  } = useBabel([hooksToCompositionPlugin]);

  useEffect(() => {
    transformReactCode(reactCode);
    localStorage.setItem(STORAGE_KEY, reactCode);
  }, [reactCode]);

  return {
    transformReactCode,
    vueCode,
    vueError,
    reactCode,
    setReactCode,
  }
}