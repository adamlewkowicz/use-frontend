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
  VUE_ON_CLEANUP,
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

const createVueOnCleanupCallExp = (
  callback: t.ArrowFunctionExpression
): t.CallExpression => createCallExp(VUE_ON_CLEANUP, [callback]);

const updateBodyOfBlockStatement = (
  blockStatement: t.BlockStatement,
  callback: (statements: t.BlockStatement['body']) => t.BlockStatement['body']
): t.BlockStatement => {
  return t.blockStatement(
    callback(blockStatement.body),
    blockStatement.directives
  );
}

const updateArrowFunctionBody = <T extends AnyFunctionExpression>(
  func: T,
  callback: (statements: t.Statement[]) => t.Statement[]
): T => {
  if (!t.isBlockStatement(func.body)) {
    throw new Error;
  }
  return t.arrowFunctionExpression(
    func.params,
    updateBodyOfBlockStatement(func.body, callback),
  ) as T;
}

type AnyFunctionExpression = t.FunctionExpression | t.ArrowFunctionExpression;

const removeStatementFromFunction = <
  S extends t.Statement,
  T extends AnyFunctionExpression,
>(
  func: T,
  statementType: S['type'],
): {
  updatedFunction: T,
  removedStatement?: S
} => {
  let removedStatement: S | undefined;

  // TODO: refactor to pure function
  const updatedFunction = updateArrowFunctionBody(func, (statements) => {
    removedStatement = statements.find(
      (statement): statement is S => statement.type === statementType
    );

    if (removedStatement) {
      return statements.filter(
        statement => statement.type !== statementType
      );
    }
    return statements;
  });

  return {
    updatedFunction,
    removedStatement,
  }
}

export const removeReturnStatementFromFunction = <T extends AnyFunctionExpression>(
  func: T
): {
  updatedFunction: T,
  removedStatement?: t.ReturnStatement,
} => removeStatementFromFunction<t.ReturnStatement, T>(func, 'ReturnStatement');

const createVueWatchCallbackWithCleanup = (
  watchCallback: t.ArrowFunctionExpression,
  cleanupCallback: t.ArrowFunctionExpression
): t.ArrowFunctionExpression => {
  const vueOnCleanup = createVueOnCleanupCallExp(cleanupCallback);

  const watchCallbackWithCleanup = updateArrowFunctionBody(watchCallback, (statements) => {
    const statementsWithoutReturn = statements.filter(
      statement => statement.type !== 'ReturnStatement'
    );
    const statementsWithCleanupCallback = [
      ...statementsWithoutReturn,
      t.expressionStatement(vueOnCleanup)
    ];

    return statementsWithCleanupCallback;
  });

  return watchCallbackWithCleanup;
}

interface VueWatchCallExpOptions {
  dependencies: any[],
  callback: t.ArrowFunctionExpression
  watchOptions?: VueWatchOptions
  cleanupCallback?: t.ArrowFunctionExpression | null
}

export const createVueWatchCallExp = ({
  dependencies,
  callback,
  watchOptions,
  cleanupCallback,
}: VueWatchCallExpOptions): t.CallExpression => {
  const depsArrayPattern = t.arrayPattern(dependencies);
  const depsArrayExp = t.arrayExpression(dependencies);
  const watchOptionsArr = watchOptions ? [createObjectExpression(watchOptions)] : [];

  const callbackParams = cleanupCallback
    ? [depsArrayPattern, t.identifier('prev'), t.identifier(VUE_ON_CLEANUP)]
    : [depsArrayPattern];

  const watchCallback = t.arrowFunctionExpression(callbackParams, callback.body);

  if (cleanupCallback) {
    const watchCallbackWithCleanup = createVueWatchCallbackWithCleanup(
      watchCallback,
      cleanupCallback
    );

    return createCallExp(VUE_WATCH, [depsArrayExp, watchCallbackWithCleanup, ...watchOptionsArr]);
  }
  
  return createCallExp(VUE_WATCH, [depsArrayExp, watchCallback, ...watchOptionsArr]);
}

type VueWatchOptions = {
  lazy?: boolean
  flush?: 'pre' | 'post' | 'sync'
  deep?: boolean
  // onTrack?: (event: unknown) => void
  // onTrigger?: (event: unknown) => void
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
export const createVueRefMember = (
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