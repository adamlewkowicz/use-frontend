
import { createVueRefCallExp, createVueRefMemberExp } from '../../helpers';
import {
  isReactUseRefCallExp,
  isReactMemberExp,
  isReactUseRefVariableDeclarator,
} from '../../assert';
import { Visitor } from 'babel-traverse';

export let refSet = new Set();

/** useRef() -> ref() */
const replaceUseRefWithRef = (): Visitor => ({
  CallExpression(path) {
    if (!isReactUseRefCallExp(path.node)) return;

    const vueRefCallExp = createVueRefCallExp(path.node.arguments[0]);

    return path.replaceWith(vueRefCallExp);
  }
});

/** foo.current -> foo.value */
const replaceDotCurrentWithDotValue = (): Visitor => ({
  MemberExpression(path) {
    const isReactMemberExpInfo = isReactMemberExp(path.node);

    if (!isReactMemberExpInfo) return;

    const { variableName } = isReactMemberExpInfo;

    const vueRefMemberExp = createVueRefMemberExp(variableName);

    path.replaceWith(vueRefMemberExp);
  },
  // tracks ".values" declarations
  VariableDeclarator(path) {
    const isReactUseRefVariableDeclaratorInfo = isReactUseRefVariableDeclarator(path.node);

    if (!isReactUseRefVariableDeclaratorInfo) return;

    const { variableName } = isReactUseRefVariableDeclaratorInfo;

    if (!refSet.has(variableName)) {
      refSet.add(variableName);
    }
  }
});

export const useRefVisitors = [
  replaceUseRefWithRef,
  replaceDotCurrentWithDotValue,
];