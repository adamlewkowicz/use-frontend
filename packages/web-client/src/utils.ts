import { hooksToCompositionPlugin } from 'babel-plugin-hooks-to-composition';
import * as babel from '@babel/core';
import { format as prettierFormatNative } from 'prettier/standalone';
import prettierBabylon from 'prettier/parser-babylon';
import React, { FunctionComponent } from 'react';

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

export const prettierFormat = (code: string): string => prettierFormatNative(code, {
  parser: 'babel',
  plugins: [prettierBabylon],
  semi: true,
});

export const normalizeError = (error: ParseError): NormalizedError => {
  if (error !== null && 'loc' in error) {
    const { message, loc: location } = error;

    if ('line' in location) {
      const { line, column } = location;
      return { line, column, message };

    } else if ('start' in location) {
      const { line, column } = location.start;
      return { line, column, message };
    }
  }

  return {
    line: 0,
    column: 0,
    message: error?.message || 'Unknown error'
  }
}

export const reactLazyNamed = <T, I extends keyof T>(
  importFactory: () => Promise<T>,
  importName: I
  // @ts-ignore
): React.LazyExoticComponent<T[I]> => {
  const defaultImportHandler = async () => {
    const importedModuleObj = await importFactory();

    return {
      default: importedModuleObj[importName]
    }
  }

  return React.lazy(defaultImportHandler as any) as any;
}
export interface NormalizedError {
  line: number
  column: number
  message: string
}

export type ParseError = PrettierParseError | BabelParseError | Error | null;

interface PrettierParseError extends Error {
  loc: {
    start: {
      line: 12
      column: 16
    }
  }
  codeFrame: string
}

interface BabelParseError extends Error {
  code: 'BABEL_PARSE_ERROR'
  pos: number
  stack: string
  message: string
  loc: {
    line: 11
    column: 2
  }
}