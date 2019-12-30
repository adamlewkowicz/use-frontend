import { PluginHandler } from '../..';
import { isUseEffectFunc } from '../../helpers';
import * as t from 'babel-types';

export const useEffectPlugin: PluginHandler = (babel) => ({
  visitor: {
    CallExpression(path) {
      const { node } = path;

      if (!isUseEffectFunc(node.callee)) return;

      const [callback, dependencies] = node.arguments;

      if (!t.isArrowFunctionExpression(callback)) return;

      if (
        t.isArrayExpression(dependencies) &&
        dependencies.elements.length !== 0
      ) {
        
      }
    }
  }
});