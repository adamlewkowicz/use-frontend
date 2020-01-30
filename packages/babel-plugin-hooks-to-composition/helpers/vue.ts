import * as t from 'babel-types';
import { InitialState } from './types';
import {
  createObjectExpression,
  createCallExp,
  updateArrowFunctionBody,
  createInitialStateCallExp,
  createCallbackCallExp,
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
  VUE_ON_UNMOUNTED,
} from '../consts';

export const createVueOnMountedCallExp = createInitialStateCallExp(VUE_ON_MOUNTED); 

export const createVueOnUpdatedCallExp = createInitialStateCallExp(VUE_ON_UPDATED);

export const createVueInjectCallExp = (args: t.CallExpression['arguments']) => createCallExp(VUE_INJECT, args);

export const createVueOnUnmounted = createCallbackCallExp(VUE_ON_UNMOUNTED);

const createVueRefCallExp = createInitialStateCallExp(VUE_REF);

const createVueReactiveCallExp = createInitialStateCallExp(VUE_REACTIVE);

const createVueOnCleanupCallExp = createCallbackCallExp(VUE_ON_CLEANUP);

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

/** variableName.{value} */
export const createVueRefMemberExp = (
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
  createVueRefMemberExp(variableName),
  expression
);

/** const stateName = reactive(initialState); */
export const createVueReactiveDeclarator = (
  stateName: string,
  initialState: InitialState,
): t.VariableDeclarator => t.variableDeclarator(
  t.identifier(stateName),
  createVueReactiveCallExp(initialState)
);

/** const stateName = ref(initialState); */
export const createVueRefDeclarator = (
  stateName: string,
  initialValue: InitialState
): t.VariableDeclarator => t.variableDeclarator(
  t.identifier(stateName),
  createVueRefCallExp(initialValue)
);

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

interface VueWatchCallExpOptions {
  dependencies: any[],
  callback: t.ArrowFunctionExpression
  watchOptions?: VueWatchOptions
  cleanupCallback?: t.ArrowFunctionExpression | null
}
