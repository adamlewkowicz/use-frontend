import * as t from 'babel-types';
import { Visitor } from 'babel-traverse';
import { isReactUseMemoCallExp } from '../../assert';
import { createVueComputedCallExp } from '../../helpers';

const replaceUseMemoWithComputed = (): Visitor => ({
  CallExpression(path) {
    const { node } = path;

    if (!isReactUseMemoCallExp(node)) return;

    const [callbackToMemoize] = node.arguments;

    if (!t.isArrowFunctionExpression(callbackToMemoize)) return;

    const vueComputedCallExp = createVueComputedCallExp(callbackToMemoize);

    path.replaceWith(vueComputedCallExp);
  }
});

export const useMemoVisitors = [
  replaceUseMemoWithComputed,
];