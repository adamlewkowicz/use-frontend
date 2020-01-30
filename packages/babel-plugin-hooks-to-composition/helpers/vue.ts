import * as t from 'babel-types';
import {
  createObjectExpression,
  createCallExp,
  updateArrowFunctionBody,
} from './base';
import {
  VUE_ON_CLEANUP,
  VUE_WATCH,
  VUE_ON_UPDATED,
  VUE_ON_MOUNTED,
  VUE_INJECT,
  VUE_REF_PROPERTY,
  VUE_REF,
  VUE_REACTIVE,
} from '../consts';

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

const createVueOnCleanupCallExp = (
  callback: t.ArrowFunctionExpression
): t.CallExpression => createCallExp(VUE_ON_CLEANUP, [callback]);

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

type VueWatchOptions = {
  lazy?: boolean
  flush?: 'pre' | 'post' | 'sync'
  deep?: boolean
  // onTrack?: (event: unknown) => void
  // onTrigger?: (event: unknown) => void
}

interface VueWatchCallExpOptions {
  dependencies: any[],
  callback: t.ArrowFunctionExpression
  watchOptions?: VueWatchOptions
  cleanupCallback?: t.ArrowFunctionExpression | null
}

type InitialState = t.Expression | t.SpreadElement;