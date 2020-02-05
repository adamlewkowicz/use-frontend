import { Visitor } from 'babel-traverse';
import { isReactUseLayoutEffectCallExp } from '../../assert';
import { createVueOnUnmountedCallExp } from '../../helpers';

const replaceUseLayoutEffectWithOnBeforeMount = (): Visitor => ({
  CallExpression(path) {
    const isReactUseLayoutEffectInfo = isReactUseLayoutEffectCallExp(path.node);
    if (!isReactUseLayoutEffectInfo) return;

    const { callback } = isReactUseLayoutEffectInfo;
    
    const vueOnUnmountedCallExp = createVueOnUnmountedCallExp(callback);
    
    path.replaceWith(vueOnUnmountedCallExp);
  }
});

export const useLayoutEffectVisitors = [
  replaceUseLayoutEffectWithOnBeforeMount,
];