import { isUseCallbackFunc } from '../../helpers';
import * as t from 'babel-types';
import { VUE_COMPUTED } from '../../consts';
import { Visitor } from 'babel-traverse';

const replaceUseCallbackWithComputed = (): Visitor => ({
  CallExpression(path) {
    const { node } = path;

    if (!isUseCallbackFunc(node.callee)) return;

    const [callbackToMemoize] = node.arguments;

    if (!t.isArrowFunctionExpression(callbackToMemoize)) return;

    const computedCallbackWrapper = t.arrowFunctionExpression(
      [],
      callbackToMemoize
    );

    const memoizedComputed = t.callExpression(
      t.identifier(VUE_COMPUTED),
      [computedCallbackWrapper]
    );

    path.replaceWith(memoizedComputed);
  }
});

export const useCallbackVisitors = [
  replaceUseCallbackWithComputed,
];