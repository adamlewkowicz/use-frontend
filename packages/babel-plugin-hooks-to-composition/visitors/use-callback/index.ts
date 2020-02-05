import { Visitor } from 'babel-traverse';
import { isReactUseCallbackCallExp } from '../../assert';
import { createVueComputedCallExp } from '../../helpers';

const replaceUseCallbackWithComputed = (): Visitor => ({
  CallExpression(path) {
    const isReactUseCallbackCallExpInfo = isReactUseCallbackCallExp(path.node);

    if (!isReactUseCallbackCallExpInfo) return;

    const { wrappedCallback } = isReactUseCallbackCallExpInfo;

    const vueComputedCallExp = createVueComputedCallExp(wrappedCallback);

    path.replaceWith(vueComputedCallExp);
  }
});

export const useCallbackVisitors = [
  replaceUseCallbackWithComputed,
];