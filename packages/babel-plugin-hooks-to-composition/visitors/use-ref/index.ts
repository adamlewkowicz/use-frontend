
import {
  createVueRefMemberExp,
  createVueRefDeclarator,
} from '../../helpers';
import {
  isReactMemberExp,
  isReactUseRefVariableDeclarator,
} from '../../assert';
import { Visitor } from 'babel-traverse';
import { trackReactUseRefDeclaration } from '../../utils';

/** useRef() -> ref() */
const replaceUseRefWithRef = (): Visitor => ({
  VariableDeclarator(path) {
    const isReactUseRefVariableDeclaratorInfo = isReactUseRefVariableDeclarator(path.node);

    if (!isReactUseRefVariableDeclaratorInfo) return;

    const { variableName, initialValue } = isReactUseRefVariableDeclaratorInfo;

    trackReactUseRefDeclaration(variableName);

    const vueRefDeclarator = createVueRefDeclarator(variableName, initialValue);

    path.replaceWith(vueRefDeclarator);
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
});

export const useRefVisitors = [
  replaceUseRefWithRef,
  replaceDotCurrentWithDotValue,
];