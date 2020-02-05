import { Visitor } from 'babel-traverse';
import { isReactUseMemoCallExp } from '../../assert';
import { createVueComputedCallExp } from '../../helpers';

const replaceUseMemoWithComputed = (): Visitor => ({
  CallExpression(path) {
    const isReactUseMemoCallExpInfo = isReactUseMemoCallExp(path.node);

    if (!isReactUseMemoCallExpInfo) return;

    const { memoizedCallback } = isReactUseMemoCallExpInfo;

    const vueComputedCallExp = createVueComputedCallExp(memoizedCallback);

    path.replaceWith(vueComputedCallExp);
  }
});

export const useMemoVisitors = [
  replaceUseMemoWithComputed,
];