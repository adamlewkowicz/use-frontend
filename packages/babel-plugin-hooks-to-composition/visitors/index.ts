import { combineVisitors } from '../utils';
import { useRefVisitors } from './use-ref';

export const rootVisitor = combineVisitors(
  ...useRefVisitors,
);