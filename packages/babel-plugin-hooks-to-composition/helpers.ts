import * as t from 'babel-types';
import {
  Expression,
  Identifier,
  ArrowFunctionExpression,
  Node
} from 'babel-types';
import {
  REACT_USE_MEMO,
  REACT_USE_CALLBACK,
  REACT_USE_EFFECT,
  REACT_USE_REF,
  VUE_REF,
  VUE_REACTIVE,
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