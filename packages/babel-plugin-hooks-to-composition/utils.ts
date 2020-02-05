import * as babel from '@babel/core';
import { VisitorHandler } from './types';
import { Visitor } from 'babel-traverse';

let refSet = new Set<string>();

export const mountPluginTester = (
  ...plugins: babel.PluginItem[]
) => (code: string): string => {
  const result = babel.transform(code.trim(), { plugins, retainLines: true });

  if (result?.code == null) {
    throw new Error(
      `Could not transform code properly: "${result?.code}"`
    );
  }

  return result.code;
}

export const testVisitors = (...visitors: VisitorHandler[]) => {
  const plugin = {
    visitor: combineVisitors(...visitors)
  }

  const pluginTester = mountPluginTester(plugin);

  return (code: string, trimCode = true): string => {
    const finalCode = trimCode ? code.trim() : code;
    return pluginTester(finalCode);
  }
}

const BABEL_PLACEHOLDER: any = null; // TODO: provide babel arg

const createVisitorMap = (
  ...visitorHandlers: VisitorHandler[]
): VisitorMap => {
  return visitorHandlers.reduce<VisitorMap>((visitorMap, visitor) => {
    const entries = Object.entries(visitor(BABEL_PLACEHOLDER)) as VisitorEntry[];

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
  const visitorMapEntries = Object.entries(visitorMap) as VisitorMapEntries;

  const rootVisitor = visitorMapEntries.reduce<Visitor>(
    (rootVisitor, [property, handlers]) => {
      
      function rootPropertyHandler(
        path: unknown,
        state: unknown
      ) {
        handlers.forEach((handler: any) => {
          const handlerType = typeof handler;

          if (handlerType === 'function') {
            return handler(path, state);
          } else {
            throw new Error(
              'Visitor entries may only be a type of function, ' + 
              'when using with "combine visitors" utility. \n' + 
              `Current type: "${handlerType}".`
            );
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

export const trackReactUseRefDeclaration = (variableName: string): void => {
  if (!refSet.has(variableName)) {
    refSet.add(variableName);
  }
} 

type VisitorMap = {
  [K in keyof Visitor]: VisitorHandler[]
}

type VisitorEntry = [keyof Visitor, Visitor[keyof Visitor]];

type VisitorMapEntries = [keyof Visitor, Visitor[keyof Visitor][]][];