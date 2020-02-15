import {
  createVueOnUpdatedCallExp,
  createVueOnMountedCallExp,
  createVueOnUnmountedCallExp,
  createVueWatchCallExp,
} from '../../helpers';
import { Visitor } from 'babel-traverse';
import { isReactUseEffectCallExp } from '../../assert';

const replaceUseEffectWithWatch = (): Visitor => ({
  Expression(path) {
    const isReactUseEffectCallExpInfo = isReactUseEffectCallExp(path.node);

    if (!isReactUseEffectCallExpInfo) return;

    const {
      dependencies,
      originalCallback,
      cleanupCallback,
      callbackWithoutCleanup,
    } = isReactUseEffectCallExpInfo;

    if (dependencies === null) {
      // no dependencies, replace with onUpdated
      const vueOnUpdated = createVueOnUpdatedCallExp(originalCallback);
      return path.replaceWith(vueOnUpdated);

    } else if (dependencies.length > 0) {
      // has dependencies, replace with watch
      const vueWatch = createVueWatchCallExp({
        callback: originalCallback,
        dependencies,
        cleanupCallback
      });

      return path.replaceWith(vueWatch);

    } else if (dependencies.length === 0) {
      // empty array, replace with onMounted
      const vueOnMounted = createVueOnMountedCallExp(originalCallback);

      // has cleanup callback, add additional onUnmounted cleanup lifecycle
      if (cleanupCallback) {
        return path.replaceWithMultiple([
          createVueOnMountedCallExp(callbackWithoutCleanup),
          createVueOnUnmountedCallExp(cleanupCallback)
        ]);
      }

      return path.replaceWith(vueOnMounted);
    }
  }
});

export const useEffectVisitors = [
  replaceUseEffectWithWatch,
];