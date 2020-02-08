import {
  t,
  DatafullAssert,
  ExpOrSpread,
  AnyFunctionExpression,
} from '../types';
import {
  ASSERT_FALSE,
  REACT_USE_LAYOUT_EFFECT,
  REACT_USE_REF,
  REACT_USE_CONTEXT,
  REACT_USE_MEMO,
  REACT_USE_CALLBACK,
  REACT_USE_EFFECT,
  REACT_USE_STATE,
  REACT_STATE_SETTER_PREFIX,
  REACT_REF_PROPERTY,
} from '../consts';
import { stateDeclarationsMap, StateDeclarationInfo } from '../visitors/use-state';
import {
  isArrayOfIdentifiers,
  isCallExpWithName,
  isAnyFunctionExpression,
} from './generic';
import { removeReturnStatementFromFunction } from '../helpers';

/** useRef(...) */
const isReactUseRefCallExpName = isCallExpWithName(REACT_USE_REF);

/** useMemo(...) */
const isReactUseMemoCallExpName = isCallExpWithName(REACT_USE_MEMO);

/** useCallback(...) */
const isReactUseCallbackCallExpName = isCallExpWithName(REACT_USE_CALLBACK);

/** useEffect(...) */
const isReactUseEffectCallExpName = isCallExpWithName(REACT_USE_EFFECT);

/** useLayoutEffect(...) */
const isReactUseLayoutEffectCallExpName = isCallExpWithName(REACT_USE_LAYOUT_EFFECT);

/** useContext(...) */
export const isReactUseContextCallExpName = isCallExpWithName(REACT_USE_CONTEXT);

/** is `useLayoutEffect(callback, dependencies)` */
export const isReactUseLayoutEffectCallExp = (node: t.CallExpression): DatafullAssert<{
  callback: AnyFunctionExpression
  dependencies: ReactDependencies
}> => {
  const isUseLayoutEffectNameInfo = isReactUseLayoutEffectCallExpName(node);
  const isDependencyCallbackInfo = isReactDependencyCallbackCallExp(node);
  
  if (!isUseLayoutEffectNameInfo) return ASSERT_FALSE;
  if (!isDependencyCallbackInfo) return ASSERT_FALSE;

  return {
    ...isDependencyCallbackInfo,
  };
}

/** is `setCounter(5)` */
export const isReactSetStateCall = (node: t.CallExpression): DatafullAssert<{
  stateValueName: string,
  setStateArg: ExpOrSpread
  stateDeclarationInfo: StateDeclarationInfo
}> => {

  if (!t.isIdentifier(node.callee)) return ASSERT_FALSE;

  const stateDeclarationInfo = stateDeclarationsMap.get(node.callee.name);

  if (!stateDeclarationInfo) return ASSERT_FALSE;
  if (!isCorrectReactStateSetterName(node.callee.name)) return ASSERT_FALSE;

  const [setStateArg] = node.arguments;
  const { stateValueName } = stateDeclarationInfo;

  if (!setStateArg) return ASSERT_FALSE;

  return {
    stateValueName: stateValueName as string,
    setStateArg,
    stateDeclarationInfo,
  };
}

const isReactUseEffectCallback = (node: ExpOrSpread): DatafullAssert<{
  cleanupCallback: null | t.ArrowFunctionExpression
  callbackWithoutCleanup: t.ArrowFunctionExpression
  originalCallback: t.ArrowFunctionExpression
}> => {
  if (!t.isArrowFunctionExpression(node)) return ASSERT_FALSE;

  const {
    updatedFunction: callbackWithoutCleanup,
    removedStatement
  } = removeReturnStatementFromFunction(node);

  const originalCallback = node;

  if (removedStatement && t.isArrowFunctionExpression(removedStatement?.argument)) {
    const cleanupCallback = removedStatement.argument;

    return {
      cleanupCallback,
      callbackWithoutCleanup,
      originalCallback
    }
  }

  return {
    cleanupCallback: null,
    callbackWithoutCleanup,
    originalCallback
  }
}

/** is `useEffect(() => {}, []);` */
export const isReactUseEffectCallExp = (node: t.Expression): DatafullAssert<{
  dependencies: ReactDependencies
  cleanupCallback: t.ArrowFunctionExpression | null
  originalCallback: t.ArrowFunctionExpression
  callbackWithoutCleanup: t.ArrowFunctionExpression
}> => {
  if (!t.isCallExpression(node)) return ASSERT_FALSE;
  if (!isReactUseEffectCallExpName(node)) return ASSERT_FALSE;

  const [callbackExp, dependenciesExp] = node.arguments;

  const isReactUseEffectCallbackInfo = isReactUseEffectCallback(callbackExp);
  const isReactDependenciesInfo = isReactDependencies(dependenciesExp);
  
  if (!isReactUseEffectCallbackInfo) return ASSERT_FALSE;
  if (!isReactDependenciesInfo) return ASSERT_FALSE;

  return {
    ...isReactUseEffectCallbackInfo,
    ...isReactDependenciesInfo
  };
}

/** is `useState(initialStateValue)` */
const isReactUseStateCallExp = (node: t.Expression): DatafullAssert<{
  initialStateValue: ExpOrSpread
}> => {
  if (!t.isCallExpression(node)) return ASSERT_FALSE;
  if (!t.isIdentifier(node.callee)) return ASSERT_FALSE;

  const [initialStateValue] = node.arguments;

  const isNotCalledUseState = node.callee.name !== REACT_USE_STATE;
  const isNoInitialStateValue = initialStateValue === undefined;

  if (isNotCalledUseState) return ASSERT_FALSE;
  if (isNoInitialStateValue) return ASSERT_FALSE;

  return { initialStateValue };
}

export const isCorrectReactStateSetterName = (name: string): boolean => name.startsWith(REACT_STATE_SETTER_PREFIX);

/** is `[counter, setCounter]` */
const isReactStateDeclarationArray = (id: t.LVal): DatafullAssert<{
  stateValue: t.Identifier,
  stateSetter: t.Identifier,
}> => {
  if (!t.isArrayPattern(id)) return ASSERT_FALSE;

  const [stateValue, stateSetter] = id.elements;

  if (!t.isIdentifier(stateValue)) return ASSERT_FALSE;
  if (!t.isIdentifier(stateSetter)) return ASSERT_FALSE;
  if (!isCorrectReactStateSetterName(stateSetter.name)) return ASSERT_FALSE;

  return { stateValue, stateSetter };
}

/** is `[counter, setCounter] = useState(0)` */
export const isReactStateDeclarator = (declarator: t.VariableDeclarator): DatafullAssert<{
  initialStateValue: ExpOrSpread,
  stateValue: t.Identifier,
  stateSetter: t.Identifier,
  initialStateValueType: 'primitive' | 'object'
}> => {
  const arrayDeclarationInfo = isReactStateDeclarationArray(declarator.id);
  const useStateInfo = isReactUseStateCallExp(declarator.init);

  if (!useStateInfo) return ASSERT_FALSE;
  if (!arrayDeclarationInfo) return ASSERT_FALSE;

  const { initialStateValue } = useStateInfo;
  const { stateSetter, stateValue } = arrayDeclarationInfo;
  const initialStateValueType = t.isLiteral(initialStateValue) ? 'primitive' : 'object';

  return {
    initialStateValue,
    stateValue,
    stateSetter,
    initialStateValueType,
  };
}

/** is `variableName.current` */
export const isReactMemberExp = (node: t.MemberExpression): DatafullAssert<{
  variableName: string
}> => {
  const { object, property } = node;

  if (!t.isIdentifier(object)) return ASSERT_FALSE;
  if (!t.isIdentifier(property)) return ASSERT_FALSE;
  if (property.name !== REACT_REF_PROPERTY) return ASSERT_FALSE;

  const variableName = object.name;

  return { variableName };
}

/** is `const variableName = useRef(initialValue);` */
export const isReactUseRefVariableDeclarator = (node: t.VariableDeclarator): DatafullAssert<{
  variableName: string
  initialValue: ExpOrSpread
}> => {
  const isReactUseRefCallExpNameInfo = isReactUseRefCallExpName(node.init);

  if (!t.isIdentifier(node.id)) return ASSERT_FALSE;
  if (!isReactUseRefCallExpNameInfo) return ASSERT_FALSE;

  const variableName = node.id.name;
  const [initialValue] = isReactUseRefCallExpNameInfo.args;

  return { variableName, initialValue };
}

/** is `useMemo(memoizedCallback, ...); */
export const isReactUseMemoCallExp = (node: t.CallExpression): DatafullAssert<{
  memoizedCallback: AnyFunctionExpression
}> => {
  const isReactUseMemoCallExpNameInfo = isReactUseMemoCallExpName(node);
  const isReactDependencyCallbackCallExpInfo = isReactDependencyCallbackCallExp(node);

  if (!isReactUseMemoCallExpNameInfo) return ASSERT_FALSE;
  if (!isReactDependencyCallbackCallExpInfo) return ASSERT_FALSE;

  const { callback: memoizedCallback } = isReactDependencyCallbackCallExpInfo;

  return { memoizedCallback };
}

const isReactDependencies = (node: ExpOrSpread): DatafullAssert<{
  dependencies: ReactDependencies
}> => {
  if (t.isArrayExpression(node)) {
    const isArrayOfIdentifiersInfo = isArrayOfIdentifiers(node);

    if (!isArrayOfIdentifiersInfo) return ASSERT_FALSE;

    const { elements: dependencies } = isArrayOfIdentifiersInfo;

    return { dependencies };
  }

  return { dependencies: null };
}

/** is `callExp(callback, dependencies)` */
const isReactDependencyCallbackCallExp = (node: t.Expression): DatafullAssert<{
  callback: AnyFunctionExpression
  dependencies: ReactDependencies
}> => {
  if (!t.isCallExpression(node)) return ASSERT_FALSE;
  
  const [callbackExp, dependenciesExp] = node.arguments;
  const isReactDependenciesInfo = isReactDependencies(dependenciesExp);
  
  if (!isReactDependenciesInfo) return ASSERT_FALSE;
  if (!isAnyFunctionExpression(callbackExp)) return ASSERT_FALSE;

  return {
    ...isReactDependenciesInfo,
    callback: callbackExp
  };
}

/** is `useCallback(callback, dependencies)` */
export const isReactUseCallbackCallExp = (node: t.CallExpression): DatafullAssert<{
  wrappedCallback: AnyFunctionExpression
}> => {
  const isReactDependencyCallbackCallExpInfo = isReactDependencyCallbackCallExp(node);

  if (!isReactUseCallbackCallExpName(node)) return ASSERT_FALSE;
  if (!isReactDependencyCallbackCallExpInfo) return ASSERT_FALSE;

  const { callback } = isReactDependencyCallbackCallExpInfo;

  const wrappedCallback = t.arrowFunctionExpression(
    [],
    callback
  );

  return { wrappedCallback };
}

type ReactDependencies = t.Identifier[] | null;