import { Visitor } from 'babel-traverse';
import { isReactUseLayoutEffect } from '../../assert';

const replaceUseLayoutEffectWithOnBeforeMount = (): Visitor => ({
  CallExpression(path) {
    const isReactUseLayoutEffectInfo = isReactUseLayoutEffect(path.node);

    if (!isReactUseLayoutEffectInfo) return;

    const {  } = isReactUseLayoutEffectInfo; 
  }
});

export const useLayoutEffectVisitors = [
  replaceUseLayoutEffectWithOnBeforeMount,
];