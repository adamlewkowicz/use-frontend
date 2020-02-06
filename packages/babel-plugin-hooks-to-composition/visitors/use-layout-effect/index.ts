import { Visitor } from 'babel-traverse';
import { isReactUseLayoutEffectCallExp } from '../../assert';
import { createVueOnBeforeMountCallExp } from '../../helpers';

const replaceUseLayoutEffectWithOnBeforeMount = (): Visitor => ({
  CallExpression(path) {
    const isReactUseLayoutEffectInfo = isReactUseLayoutEffectCallExp(path.node);
    if (!isReactUseLayoutEffectInfo) return;

    const { callback } = isReactUseLayoutEffectInfo;
    
    const vueOnBeforeMountCallExp = createVueOnBeforeMountCallExp(callback);
    
    path.replaceWith(vueOnBeforeMountCallExp);
  }
});

export const useLayoutEffectVisitors = [
  replaceUseLayoutEffectWithOnBeforeMount,
];