import * as babel from '@babel/core';

export const mountPluginTester = (
  ...plugins: babel.PluginItem[]
) => (code: string): string => {
  const result = babel.transform(code, { plugins });

  if (result?.code == null) {
    throw new Error(
      `Could not transform code properly: "${result?.code}"`
    );
  }

  return result.code;
}