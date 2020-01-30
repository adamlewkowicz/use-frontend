import * as t from 'babel-types';
import { REACT_USE_REF } from '../consts';
import { InitialState } from './types';
import { createInitialStateCallExp } from './generic';

/** const stateName = useRef(initialState); */
export const createReactUseRefDeclarator = (
  variableName: string,
  initialValue: InitialState
): t.VariableDeclarator => t.variableDeclarator(
  t.identifier(variableName),
  createReactUseRefCallExp(initialValue)
);

export const createReactUseRefCallExp = createInitialStateCallExp(REACT_USE_REF);