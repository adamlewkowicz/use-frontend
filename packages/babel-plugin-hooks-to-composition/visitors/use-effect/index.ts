import {
  isUseEffectFunc,
  createVueOnUpdated,
  createVueOnMounted,
  createVueOnUnmounted,
  createVueWatchCallExp,
} from '../../helpers';
import * as t from 'babel-types';
import { Visitor } from 'babel-traverse';

const replaceUseEffectWithWatch = (): Visitor => ({
  CallExpression(path) {
    const { node } = path;

    if (!isUseEffectFunc(node.callee)) return;

    // useEffect(callback, dependencies)
    const [callback, dependencies] = node.arguments;

    if (!t.isArrowFunctionExpression(callback)) return;
    if (!t.isBlock(callback.body)) return;

    if (t.isArrayExpression(dependencies)) {
      if (dependencies.elements.length) {
        // has dependencies, replace with watch
        const vueWatch = createVueWatchCallExp(dependencies.elements, callback);
        return path.replaceWith(vueWatch);
      } else {
        // empty array, replace with onMounted
        const vueOnMounted = createVueOnMounted(callback);

        const returnStatement = callback.body.body.find(
          (statement): statement is t.ReturnStatement => t.isReturnStatement(statement)
        );

        const cleanupCallback = returnStatement?.argument;

        if (t.isArrowFunctionExpression(cleanupCallback)) {
          // returns cleanup callback and adds additional onUnmounted cleanup lifecycle
          return path.replaceExpressionWithStatements([
            createVueOnMounted(callback),
            createVueOnUnmounted(cleanupCallback)
          ]);
        } else {
          return path.replaceWith(vueOnMounted);
        }
      }
    } else {
      // no dependencies, replace with onUpdated
      const vueOnUpdated = createVueOnUpdated(callback);
      return path.replaceWith(vueOnUpdated);
    }
  }
});

export const useEffectVisitors = [
  replaceUseEffectWithWatch,
];