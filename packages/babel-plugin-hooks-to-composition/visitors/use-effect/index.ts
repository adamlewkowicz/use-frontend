import { isUseEffectFunc } from '../../helpers';
import * as t from 'babel-types';
import { Visitor } from 'babel-traverse';

const replaceUseEffectWithWatch = (): Visitor => ({
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
});

export const useEffectVisitors = [
  replaceUseEffectWithWatch,
];