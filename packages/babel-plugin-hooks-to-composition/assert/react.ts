import * as t from 'babel-types';
import { DatafullAssert } from '../types';
import { isCorrectStateSetterName, isUseEffectFunc } from '../helpers';
import {
  ASSERT_FALSE,
  REACT_USE_LAYOUT_EFFECT,
  REACT_USE_REF,
} from '../consts';
import { stateDeclarationsMap, StateDeclarationInfo } from '../visitors/use-state';
import { isArrayOfIdentifiers, isCallExpWithName } from './generic';

/** useRef(...) */
export const isReactUseRefCallExp = isCallExpWithName(REACT_USE_REF);

/** is `useLayoutEffect(callback, dependencies)` */
export const isReactUseLayoutEffect = (node: t.CallExpression): DatafullAssert<{
  // dependencies: ReactDependencies
}> => {
  if (!t.isIdentifier(node.callee)) return ASSERT_FALSE;
  if (node.callee.name !== REACT_USE_LAYOUT_EFFECT) return ASSERT_FALSE;

  const [callback, deps] = node.arguments;

  if (!t.isArrowFunctionExpression(callback)) return ASSERT_FALSE;

  const isArrayOfIdentifiersInfo = isArrayOfIdentifiers(deps);

  if (!isArrayOfIdentifiersInfo) return ASSERT_FALSE;

  const { elements: dependencies } = isArrayOfIdentifiersInfo;


  if (t.isArrayExpression(dependencies)) {
    // TODO: handle dependencies

  } else { // no dependencies

    return {
      // dependencies: null,
    }
  }

  return ASSERT_FALSE;
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
    stateValueName: stateValueName as string,
    setStateArg,
    stateDeclarationInfo,
  };
}

const isReactUseEffectCallback = (callback: t.Expression | t.SpreadElement): DatafullAssert<{
  cleanupCallback: null | t.ArrowFunctionExpression
  callback: t.ArrowFunctionExpression
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
        cleanupCallback,
        callback,
      }
    }
  }

  return {
    cleanupCallback: null,
    callback,
  }
}

/** is `useEffect(() => {}, []);` */
export const isReactUseEffectCallExp = (node: t.CallExpression): DatafullAssert<{
  dependencies: ReactDependencies
  cleanupCallback: t.ArrowFunctionExpression | null
  originalCallback: t.ArrowFunctionExpression
}> => {
  if (!isUseEffectFunc(node.callee)) return ASSERT_FALSE;

  const [callback, deps] = node.arguments;

  const isReactUseEffectCallbackInfo = isReactUseEffectCallback(callback);
  
  if (!isReactUseEffectCallbackInfo) return ASSERT_FALSE;

  const {
    callback: originalCallback,
    cleanupCallback,
  } = isReactUseEffectCallbackInfo;
  
  if (t.isArrayExpression(deps)) {
    const isArrayOfIdentifiersInfo = isArrayOfIdentifiers(deps);

    if (!isArrayOfIdentifiersInfo) return ASSERT_FALSE;

    const { elements: dependencies } = isArrayOfIdentifiersInfo;

    return {
      dependencies,
      originalCallback,
      cleanupCallback,
    }
  } else {
    // no dependencies
    return {
      dependencies: null,
      originalCallback,
      cleanupCallback,
    }
  }
}

type ReactDependencies = t.Identifier[] | null;