import * as babel from '@babel/core';
import { useState } from 'react';

export const useBabel = (plugins?: babel.PluginItem[]) => {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<null | Error>(null);

  const transform = (codeToTransform: string) => {
    try {
      if (error) setError(null);

      const transformedCode = babel.transform(codeToTransform, {
        retainLines: true,
        plugins,
      });
  
      if (transformedCode?.code != null) {
        setCode(transformedCode.code);
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