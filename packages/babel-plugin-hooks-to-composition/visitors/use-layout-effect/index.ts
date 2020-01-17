import { Visitor } from '@babel/traverse';

const replaceUseLayoutEffectWithOnBeforeMount = (): Visitor => ({
  CallExpression(path) {
  }
});

export const useLayoutEffectVisitors = [
  replaceUseLayoutEffectWithOnBeforeMount,
];