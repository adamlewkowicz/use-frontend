import * as babel from '@babel/core';
import { VisitorHandler } from './types';
import { Visitor } from 'babel-traverse';

export const mountPluginTester = (
  ...plugins: babel.PluginItem[]
) => (code: string): string => {
  const result = babel.transform(code, { plugins, retainLines: true });

  if (result?.code == null) {
    throw new Error(
      `Could not transform code properly: "${result?.code}"`
    );
  }

  return result.code;
}

type VisitorMap = {
  [K in keyof Visitor]: VisitorHandler[]
}

type VisitorEntry = [keyof Visitor, Visitor[keyof Visitor]];

const createVisitorMap = (
  ...visitorHandlers: VisitorHandler[]
): VisitorMap => {
  return visitorHandlers.reduce<VisitorMap>((visitorMap, visitor) => {
    const entries = Object.entries(visitor) as VisitorEntry[];

    entries.forEach(([property, handler]) => {
      if (!visitorMap[property]) {
        visitorMap[property] = [];
      }
      visitorMap[property]?.push(handler as any);
    });

    return visitorMap;
  }, {});
}

export const combineVisitors = (
  ...visitors: VisitorHandler[]
): Visitor => {
  const visitorMap = createVisitorMap(...visitors);
  const visitorMapEntries = Object.entries(visitorMap) as [keyof Visitor, Visitor[keyof Visitor][]][];

  const rootVisitor = visitorMapEntries.reduce<Visitor>(
    (rootVisitor, [property, handlers]) => {
      
      function rootPropertyHandler(
        path: unknown,
        state: unknown
      ) {
        handlers.forEach((handler: any) => {
          if (typeof handler === 'function') {
            handler(path, state);
          }
        });
      }

      return {
        ...rootVisitor,
        [property]: rootPropertyHandler
      }
    },
    {}
  );

  return rootVisitor;
}