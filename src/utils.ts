import * as babel from '@babel/core';
import { PluginPartial } from './types';
import { Visitor } from 'babel-traverse';

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

type VisitorMap = {
  [K in keyof Visitor]: Visitor[K][]
}

type VisitorEntry = [keyof Visitor, Visitor[keyof Visitor]];

const createVisitorMap = (...visitors: PluginPartial[]): VisitorMap => {
  return visitors.reduce<VisitorMap>((visitorMap, visitor) => {

    const visitorEntries = Object.entries(visitor) as VisitorEntry[];

    visitorEntries.map(([name, handler]) => {

    });

    visitorEntries.forEach(([name, handler]: VisitorEntry) => {
      if (visitorMap[name]) {
        // visitorMap[name] = [];
      }
      
    });

    return {
      ...visitorMap,
    }
  }, {});
}

export const combinePartials = (
  ...pluginPartials: PluginPartial[]
): Visitor => {
  const groupedVisitorFunctions = () => {}

  return pluginPartials.reduce<Visitor>((combinedVisitor, pluginPartial) => {
    const functions = Object.entries(pluginPartial) as [keyof Visitor, Visitor[keyof Visitor]][];

    // for (const [name, fn] of functions) {
    //   if (!combinedVisitor[name]) {}
    // }


    type x = keyof Visitor

    const visitor: Visitor = {
      ...combinedVisitor,
      [name as keyof Visitor]: (path: babel.NodePath<unknown>) => {
        
      }
    }

    return visitor;
  }, {});
}