import { REACT_USE_REF } from '../consts';
import { createVariableDeclarator, createGenericCallExp } from './generic';
import { t, ExpOrSpread } from '../types';

export const createReactUseRefCallExp = createGenericCallExp(REACT_USE_REF);

/** const stateName = useRef(initialState); */
export const createReactUseRefDeclarator = (
  stateName: string,
  initialState: ExpOrSpread
): t.VariableDeclarator => createVariableDeclarator(
  stateName,
  createReactUseRefCallExp(initialState)
);