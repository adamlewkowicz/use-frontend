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
} from './consts';
import { Node } from './types';

type InitialState = t.Expression | t.SpreadElement;

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

/** ref(initialState); */
export const createVueRef = (
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

export const createReactUseRef = (
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

export const createVueOnUnmounted = createFunctionWithCallback(VUE_ON_UNMOUNTED);

export const createVueWatch = (
  dependencies: any[],
  callback: t.ArrowFunctionExpression
) => {
  const callbackWithArgs = t.arrowFunctionExpression(
    [t.arrayPattern(dependencies)],
    callback.body
  );

  return t.callExpression(
    t.identifier(VUE_WATCH),
    [t.arrayExpression(dependencies), callbackWithArgs]
  );
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