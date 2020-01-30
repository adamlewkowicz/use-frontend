import * as t from 'babel-types';
import { REACT_USE_REF } from '../consts';
import { InitialState } from './types';

/** const stateName = useRef(initialState); */
export const createReactUseRefDeclarator = (
  variableName: string,
  initialValue: InitialState
): t.VariableDeclarator => t.variableDeclarator(
  t.identifier(variableName),
  createReactUseRefCall(initialValue)
);

export const createReactUseRefCall = (
  initialState: InitialState
): t.CallExpression => t.callExpression(
  t.identifier(REACT_USE_REF),
  [initialState],
);