import {
  createVueOnUpdated,
  createVueOnMounted,
  createVueOnUnmounted,
  createVueWatchCallExp,
  removeReturnStatementFromFunction,
} from '../../helpers';
import { Visitor } from 'babel-traverse';
import { isReactUseEffectCallExp } from '../../assert';

const replaceUseEffectWithWatch = (): Visitor => ({
  CallExpression(path) {
    const isReactUseEffectCallExpInfo = isReactUseEffectCallExp(path.node);

    if (!isReactUseEffectCallExpInfo.result) return;

    const { dependencies, originalCallback, cleanupCallback } = isReactUseEffectCallExpInfo;

    if (dependencies === null) {
      // TODO:
      // no dependencies, replace with onUpdated
      const vueOnUpdated = createVueOnUpdated(originalCallback);
      return path.replaceWith(vueOnUpdated);
    } else if (dependencies.length) {
      // has dependencies, replace with watch
      const vueWatch = createVueWatchCallExp({
        callback: originalCallback,
        dependencies,
        cleanupCallback
      });

      return path.replaceWith(vueWatch);
    } else {
      // empty array, replace with onMounted
      const vueOnMounted = createVueOnMounted(originalCallback);

      // cleanup callback, add additional onUnmounted cleanup lifecycle
      if (cleanupCallback) {
        const {
          updatedFunction: callbackWithoutCleanup
        } = removeReturnStatementFromFunction(originalCallback);

        return path.replaceExpressionWithStatements([
          createVueOnMounted(callbackWithoutCleanup),
          createVueOnUnmounted(cleanupCallback)
        ]);
      }

      return path.replaceWith(vueOnMounted);
    }
  }
});

export const useEffectVisitors = [
  replaceUseEffectWithWatch,
];