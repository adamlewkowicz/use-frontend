import * as babel from '@babel/core';
import { useState } from 'react';
import { prettierFormat } from '../utils';

export const useBabel = (plugins?: babel.PluginItem[], usePrettier = true) => {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<null | Error>(null);

  const transform = (codeToTransform: string) => {
    try {
      if (error) setError(null);

      const transformedOutput = babel.transform(codeToTransform, {
        retainLines: true,
        plugins,
      });

      if (transformedOutput?.code != null) {
        const { code } = transformedOutput;
        
        if (usePrettier) {
          const prettifiedCode = prettierFormat(code);
          setCode(prettifiedCode);
        } else {
          setCode(code);
        }
      }
    } catch(error) {
      setError(error);
    }
  }

  return {
    code,
    error,
    transform,
  }
}