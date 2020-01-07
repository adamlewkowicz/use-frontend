import { combineVisitors } from '../utils';
import { useRefVisitors } from './use-ref';
import { useMemoVisitors } from './use-memo';
import { useCallbackVisitors } from './use-callback';
import { useEffectVisitors } from './use-effect';
import { useStateVisitors } from './use-state';

export const rootVisitor = combineVisitors(
  ...useRefVisitors,
  ...useMemoVisitors,
  ...useCallbackVisitors,
  ...useEffectVisitors,
  ...useStateVisitors,
);