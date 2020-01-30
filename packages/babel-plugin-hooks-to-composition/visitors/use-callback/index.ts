import * as t from 'babel-types';
import { Visitor } from 'babel-traverse';
import { isReactUseCallbackCallExp } from '../../assert';
import { createVueComputedCallExp } from '../../helpers';

const replaceUseCallbackWithComputed = (): Visitor => ({
  CallExpression(path) {
    const { node } = path;

    if (!isReactUseCallbackCallExp(node)) return;

    const [callbackToMemoize] = node.arguments;

    if (!t.isArrowFunctionExpression(callbackToMemoize)) return;

    const computedCallbackWrapper = t.arrowFunctionExpression(
      [],
      callbackToMemoize
    );

    const vueComputedCallExp = createVueComputedCallExp(computedCallbackWrapper);

    path.replaceWith(vueComputedCallExp);
  }
});

export const useCallbackVisitors = [
  replaceUseCallbackWithComputed,
];