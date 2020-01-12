import { hooksToCompositionPlugin } from 'babel-plugin-hooks-to-composition';
import * as babel from '@babel/core';
import prettier from 'prettier';

export const transformCode = (code: string): string | null => {
  const transformedCode = babel.transform(code, {
    plugins: [hooksToCompositionPlugin],
    retainLines: true
  });

  if (!transformedCode?.code) {
    return null;
  }

  return transformedCode?.code;
}

export const prettierFormat = (code: string) => prettier.format(code, {
  parser: 'babel',
  semi: true,
});