import * as t from 'babel-types';
import {
  createObjectExpression,
  createCallExp,
  updateArrowFunctionBody,
  createGenericCallExp,
  createVariableDeclarator,
  createMemberExp,
} from './generic';
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
  VUE_PREV,
  VUE_COMPUTED,
  OPERATOR,
  VUE_ON_BEFORE_MOUNT,
} from '../consts';
import { AnyFunctionExpression, ExpOrSpread } from '../types';

export const createVueOnMountedCallExp = createGenericCallExp(VUE_ON_MOUNTED);

export const createVueOnUpdatedCallExp = createGenericCallExp(VUE_ON_UPDATED);

export const createVueInjectCallExp = createGenericCallExp<ExpOrSpread[]>(VUE_INJECT);

export const createVueOnUnmountedCallExp = createGenericCallExp<AnyFunctionExpression>(VUE_ON_UNMOUNTED);

export const createVueOnBeforeMountCallExp = createGenericCallExp<AnyFunctionExpression>(VUE_ON_BEFORE_MOUNT);

const createVueRefCallExp = createGenericCallExp(VUE_REF);

export const createVueComputedCallExp = createGenericCallExp<AnyFunctionExpression>(VUE_COMPUTED);

const createVueReactiveCallExp = createGenericCallExp(VUE_REACTIVE);

const createVueOnCleanupCallExp = createGenericCallExp<AnyFunctionExpression>(VUE_ON_CLEANUP);

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
): t.MemberExpression => createMemberExp(
  variableName,
  VUE_REF_PROPERTY
);

/** variableName.value = expression;
 * Adds .value as variable property.
 */
export const createVueRefValueAssignment = (
  variableName: string,
  expression: t.Expression
): t.AssignmentExpression => t.assignmentExpression(
  OPERATOR.equal,
  createVueRefMemberExp(variableName),
  expression
);

/** const stateName = reactive(initialState); */
export const createVueReactiveDeclarator = (
  stateName: string,
  initialState: ExpOrSpread,
): t.VariableDeclarator => createVariableDeclarator(
  stateName,
  createVueReactiveCallExp(initialState)
);

/** const stateName = ref(initialState); */
export const createVueRefDeclarator = (
  stateName: string,
  initialState: ExpOrSpread
): t.VariableDeclarator => createVariableDeclarator(
  stateName,
  createVueRefCallExp(initialState)
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
    ? [depsArrayPattern, t.identifier(VUE_PREV), t.identifier(VUE_ON_CLEANUP)]
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
