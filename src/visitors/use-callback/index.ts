import { PluginHandler } from '../..';
import { isUseCallbackFunc } from '../../helpers';
import * as t from 'babel-types';
import { VUE_COMPUTED } from '../../consts';

export const useCallbackPlugin: PluginHandler = () => ({
  visitor: {
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
  }
});