import * as t from 'babel-types';
import {
  Expression,
  Identifier,
  ArrowFunctionExpression,
} from 'babel-types';
import {
  REACT_USE_MEMO,
  REACT_USE_CALLBACK,
  REACT_USE_EFFECT,
  REACT_USE_REF,
  VUE_REF,
  VUE_REACTIVE,
  VUE_ON_UPDATED,
  VUE_ON_MOUNTED,
  VUE_ON_UNMOUNTED,
  VUE_WATCH,
  REACT_USE_CONTEXT,
  VUE_INJECT,
  REACT_STATE_SETTER_PREFIX,
  REACT_USE_STATE,
  ASSERT_FALSE,
  VUE_REF_PROPERTY,
} from '../consts';
import { Node, DatafullAssert } from '../types';
import { createObjectExpression } from './base';

type InitialState = t.Expression | t.SpreadElement;

const isExpressionAFuncWithName = (functionName: string) => (exp: Expression): exp is Identifier => t.isIdentifier(exp) && exp.name === functionName;

/** useMemo(...) */
export const isUseMemoFunc = (exp: Expression): exp is Identifier => t.isIdentifier(exp) && exp.name === REACT_USE_MEMO;

/** useCallback(...) */
export const isUseCallbackFunc = (exp: Expression): exp is Identifier => t.isIdentifier(exp) && exp.name === REACT_USE_CALLBACK;

/** useEffect(...) */
export const isUseEffectFunc = (exp: Expression): exp is Identifier => t.isIdentifier(exp) && exp.name === REACT_USE_EFFECT;

/** useRef(...) */
export const isUseRefFunc = (exp: Expression): exp is Identifier => t.isIdentifier(exp) && exp.name === REACT_USE_REF;

/** setState(c => c + 1) */
export const isSetStateCallback = (node: Node): node is ArrowFunctionExpression => t.isArrowFunctionExpression(node) && t.isBinaryExpression(node.body);

/** useContext(...) */
export const isUseContextFunc = (exp: Expression): exp is Identifier => t.isIdentifier(exp) && exp.name === REACT_USE_CONTEXT;

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

  return { result: true, initialStateValue };
}

/** ref(initialState); */
export const createVueRefCall = (
  initialState: InitialState
): t.CallExpression => t.callExpression(
  t.identifier(VUE_REF),
  [initialState],
);

export const createVueReactive = (
  initialState: InitialState
): t.CallExpression => t.callExpression(
  t.identifier(VUE_REACTIVE),
  [initialState],
);

export const createReactUseRefCall = (
  initialState: InitialState
): t.CallExpression => t.callExpression(
  t.identifier(REACT_USE_REF),
  [initialState],
);

/** functionName(callback); */
const createFunctionWithCallback = (functionName: string) => (
  callback: t.ArrowFunctionExpression
) => t.callExpression(
  t.identifier(functionName),
  [callback]
);

/** const stateName = reactive(initialState); */
export const createVueReactiveDeclarator = (
  stateName: string,
  initialState: InitialState,
): t.VariableDeclarator => t.variableDeclarator(
  t.identifier(stateName),
  createVueReactive(initialState)
);

/** const stateName = ref(initialState); */
export const createVueRefDeclarator = (
  variableName: string,
  initialValue: InitialState
): t.VariableDeclarator => t.variableDeclarator(
  t.identifier(variableName),
  createVueRefCall(initialValue)
);

/** const stateName = useRef(initialState); */
export const createReactUseRefDeclarator = (
  variableName: string,
  initialValue: InitialState
): t.VariableDeclarator => t.variableDeclarator(
  t.identifier(variableName),
  createReactUseRefCall(initialValue)
);

export const createVueOnUnmounted = createFunctionWithCallback(VUE_ON_UNMOUNTED);

/** functionName(...deps) */
const createCallExp = (
  functionName: string,
  args: (t.Expression | t.SpreadElement)[]
): t.CallExpression => t.callExpression(
  t.identifier(functionName),
  args
);

export const createVueWatchCallExp = (
  dependencies: any[],
  callback: t.ArrowFunctionExpression,
  watchOptions?: VueWatchOptions
): t.CallExpression => {
  const callbackWithArgs = t.arrowFunctionExpression(
    [t.arrayPattern(dependencies)],
    callback.body
  );

  const baseArgs =  [
    t.arrayExpression(dependencies),
    callbackWithArgs,
  ];

  if (watchOptions) {
    const optionsObjectExpression = createObjectExpression(watchOptions);
    
    return createCallExp(VUE_WATCH, [...baseArgs, optionsObjectExpression]);
  }
  
  return createCallExp(VUE_WATCH, baseArgs);
}

type VueWatchOptions = {
  lazy?: boolean
  flush?: 'pre' | 'post' | 'sync'
  deep?: boolean
  onTrack?: (event: unknown) => void
  onTrigger?: (event: unknown) => void
}

export const createVueOnUpdated = (
  callback: t.ArrowFunctionExpression
) => t.callExpression(
  t.identifier(VUE_ON_UPDATED),
  [callback]
);

export const createVueOnMounted = (
  callback: t.ArrowFunctionExpression
) => t.callExpression(
  t.identifier(VUE_ON_MOUNTED),
  [callback]
);

export const createVueInject = (
  args: t.CallExpression['arguments']
): t.CallExpression => t.callExpression(
  t.identifier(VUE_INJECT),
  args
);

export const isCorrectStateSetterName = (name: string): boolean => name.startsWith(REACT_STATE_SETTER_PREFIX);

/** variableName = expression; */
export const createAssignment = (
  variableName: string,
  expression: t.Expression,
): t.AssignmentExpression => {
  return t.assignmentExpression(
    '=',
    t.identifier(variableName),
    expression
  );
}

/** variableName.{value} */
const createVueRefMember = (
  variableName: string
): t.MemberExpression => t.memberExpression(
  t.identifier(variableName),
  t.identifier(VUE_REF_PROPERTY)
);

/** variableName.value = expression;
 * Adds .value as variable property.
 */
export const createVueRefValueAssignment = (
  variableName: string,
  expression: t.Expression
): t.AssignmentExpression => t.assignmentExpression(
  '=',
  createVueRefMember(variableName),
  expression
);

/** is `[counter, setCounter]` */
const isReactStateDeclarationArray = (id: t.LVal): DatafullAssert<{
  stateValue: t.Identifier,
  stateSetter: t.Identifier,
}> => {
  if (!t.isArrayPattern(id)) return ASSERT_FALSE;

  const [stateValue, stateSetter] = id.elements;

  if (!t.isIdentifier(stateValue)) return ASSERT_FALSE;
  if (!t.isIdentifier(stateSetter)) return ASSERT_FALSE;
  if (!isCorrectStateSetterName(stateSetter.name)) return ASSERT_FALSE;

  return { result: true, stateValue, stateSetter };
}

/** is `[counter, setCounter] = useState(0)` */
export const isReactStateDeclarator = (declarator: t.VariableDeclarator): DatafullAssert<{
  initialStateValue: t.Expression | t.SpreadElement,
  stateValue: t.Identifier,
  stateSetter: t.Identifier,
}> => {
  const arrayDeclarationInfo = isReactStateDeclarationArray(declarator.id);
  const useStateInfo = isUseStateFunc(declarator.init);

  if (!useStateInfo.result) return ASSERT_FALSE;
  if (!arrayDeclarationInfo.result) return ASSERT_FALSE;

  const { initialStateValue } = useStateInfo;
  const { stateSetter, stateValue } = arrayDeclarationInfo;

  return {
    result: true,
    initialStateValue,
    stateValue,
    stateSetter,
  };
}