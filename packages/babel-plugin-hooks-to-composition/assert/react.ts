import * as t from 'babel-types';
import { DatafullAssert } from '../types';
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
} from '../consts';
import { stateDeclarationsMap, StateDeclarationInfo } from '../visitors/use-state';
import { isArrayOfIdentifiers, isCallExpWithName } from './generic';

/** useRef(...) */
export const isReactUseRefCallExp = isCallExpWithName(REACT_USE_REF);

/** useContext(...) */
export const isReactUseContextCallExp = isCallExpWithName(REACT_USE_CONTEXT);

/** useMemo(...) */
export const isReactUseMemoCallExp = isCallExpWithName(REACT_USE_MEMO);

/** useCallback(...) */
export const isReactUseCallbackCallExp = isCallExpWithName(REACT_USE_CALLBACK);

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
  const assertName = isCallExpWithName(REACT_USE_EFFECT);

  if (!assertName(node)) return ASSERT_FALSE;

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

const isUseStateFunc = (exp: t.Expression): DatafullAssert<{
  initialStateValue: t.Expression | t.SpreadElement
}> => {
  if (!t.isCallExpression(exp)) return ASSERT_FALSE;
  if (!t.isIdentifier(exp.callee)) return ASSERT_FALSE;

  const [initialStateValue] = exp.arguments;

  const isNotCalledUseState = exp.callee.name !== REACT_USE_STATE;
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
  initialStateValue: t.Expression | t.SpreadElement,
  stateValue: t.Identifier,
  stateSetter: t.Identifier,
}> => {
  const arrayDeclarationInfo = isReactStateDeclarationArray(declarator.id);
  const useStateInfo = isUseStateFunc(declarator.init);

  if (!useStateInfo) return ASSERT_FALSE;
  if (!arrayDeclarationInfo) return ASSERT_FALSE;

  const { initialStateValue } = useStateInfo;
  const { stateSetter, stateValue } = arrayDeclarationInfo;

  return {
    initialStateValue,
    stateValue,
    stateSetter,
  };
}

type ReactDependencies = t.Identifier[] | null;