import * as babel from '@babel/core';
import { useState } from 'react';
import { prettierFormat, normalizeError, NormalizedError } from '../utils';

export const useBabel = (plugins?: babel.PluginItem[], usePrettier = true) => {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<null | NormalizedError>(null);

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
      setError(normalizeError(error));
    }
  }

  return {
    code,
    error,
    transform,
  }
}