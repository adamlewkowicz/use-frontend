import * as t from 'babel-types';
import { Expression, Identifier } from 'babel-types';
import {
  REACT_USE_MEMO,
} from './consts';

export const isUseMemoFunc = (exp: Expression): exp is Identifier => t.isIdentifier(exp) && exp.name === REACT_USE_MEMO;
