import * as t from 'babel-types';
import { REACT_USE_REF } from '../consts';
import { InitialState } from './types';
import { createInitialStateCallExp } from './generic';

/** const stateName = useRef(initialState); */
export const createReactUseRefDeclarator = (
  stateName: string,
  initialState: InitialState
): t.VariableDeclarator => t.variableDeclarator(
  t.identifier(stateName),
  createReactUseRefCallExp(initialState)
);

export const createReactUseRefCallExp = createInitialStateCallExp(REACT_USE_REF);