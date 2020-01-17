import * as t from 'babel-types';
import { DatafullAssert } from './types';
import { isCorrectStateSetterName } from './helpers';
import { ASSERT_FALSE, REACT_USE_LAYOUT_EFFECT } from './consts';
import { stateDeclarationsMap, StateDeclarationInfo } from './visitors/use-state';

/** is `useLayoutEffect(callback, dependencies)` */
const isReactUseLayoutEffect = (node: t.CallExpression): DatafullAssert => {
  if (!t.isIdentifier(node.callee)) return ASSERT_FALSE;
  if (node.callee.name !== REACT_USE_LAYOUT_EFFECT) return ASSERT_FALSE;

  const [callback, dependencies] = node.arguments;

  if (!t.isArrowFunctionExpression(callback)) return ASSERT_FALSE;

  if (t.isArrayExpression(dependencies)) {
    // TODO: handle dependencies

  } else { // no dependencies

  }

  return { result: true };
}

/** is `setCounter(5)` */
export const isReactSetStateCall = (node: t.CallExpression): DatafullAssert<{
  stateValueName: string,
  setStateArg: t.Expression | t.SpreadElement
  stateDeclarationInfo: StateDeclarationInfo
}> => {

  if (!t.isIdentifier(node.callee)) return ASSERT_FALSE;

  const stateDeclarationInfo = stateDeclarationsMap.get(node.callee.name);

  if (!stateDeclarationInfo) return ASSERT_FALSE;
  if (!isCorrectStateSetterName(node.callee.name)) return ASSERT_FALSE;

  const [setStateArg] = node.arguments;
  const { stateValueName } = stateDeclarationInfo;

  if (!setStateArg) return ASSERT_FALSE;

  return {
    result: true,
    stateValueName: stateValueName as string,
    setStateArg,
    stateDeclarationInfo,
  };
}