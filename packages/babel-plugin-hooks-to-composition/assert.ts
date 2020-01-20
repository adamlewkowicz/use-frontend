import * as t from 'babel-types';
import { DatafullAssert } from './types';
import { isCorrectStateSetterName, isUseEffectFunc } from './helpers';
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

const isExpressionsOfType = <T extends t.Expression>(
  expressions: (t.Expression | null | t.SpreadElement)[],
  expressionType: T['type']
): expressions is T[] => expressions.some(exp => exp === null || exp.type !== expressionType);

const isExpressionsOfIdentifier = (
  expressions: (t.Expression | null | t.SpreadElement)[]
): expressions is t.Identifier[] => isExpressionsOfType(expressions, 'Identifier');

/** is `[a, b]` - array of identifiers */
const isArrayOfIdentifiers = (node: t.Expression | t.SpreadElement): DatafullAssert<{
  elements: t.Identifier[]
}> => {
  if (!t.isArrayExpression(node)) return ASSERT_FALSE;
  if (!isExpressionsOfIdentifier(node.elements)) return ASSERT_FALSE;

  return {
    result: true,
    elements: node.elements,
  };
}

const isReactUseEffectCallback = (callback: t.Expression | t.SpreadElement): DatafullAssert<{
  cleanupCallback: null | t.ArrowFunctionExpression
}> => {
  if (!t.isArrowFunctionExpression(callback)) return ASSERT_FALSE;
  if (!t.isBlock(callback.body)) return ASSERT_FALSE;

  const returnStatement = callback.body.body.find(
    (element): element is t.ReturnStatement => t.isReturnStatement(element)
  );

  if (returnStatement) {
    if (t.isArrowFunctionExpression(returnStatement.argument)) {
      const cleanupCallback = returnStatement.argument;

      return {
        result: true,
        cleanupCallback,
      }
    }
  }

  return {
    result: true,
    cleanupCallback: null,
  }
}

/** is `useEffect(() => {}, []);` */
export const isReactUseEffect = (node: t.CallExpression): DatafullAssert<{
  dependencies: t.Identifier[]
  cleanupCallback: t.ArrowFunctionExpression | null
}> => {
  if (!isUseEffectFunc(node.callee)) return ASSERT_FALSE;

  const [callback, deps] = node.arguments;

  const isReactUseEffectCallbackInfo = isReactUseEffectCallback(callback);
  const isArrayOfIdentifiersInfo = isArrayOfIdentifiers(deps);

  if (!isReactUseEffectCallbackInfo.result) return ASSERT_FALSE;
  if (!isArrayOfIdentifiersInfo.result) return ASSERT_FALSE;

  const { cleanupCallback } = isReactUseEffectCallbackInfo;
  const { elements: dependencies } = isArrayOfIdentifiersInfo;

  return {
    result: true,
    dependencies,
    cleanupCallback,
  };
}