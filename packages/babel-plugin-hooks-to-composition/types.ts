import * as t from 'babel-types';
import { Visitor } from 'babel-traverse';
import { NodePath } from '@babel/core';

interface Babel {
  types: typeof t;
}

export type Primitive = number | string | boolean | null;

export type PluginHandler = (babel: Babel) => {
  name?: string
  visitor: Visitor
}

export type PluginPartial = (babel: Babel) => Visitor;
export { PluginPartial as VisitorHandler };

export type Node<N = t.Node> = NodePath<N>['node'];

interface DatafullAssertBase {
  result: boolean
}
export interface DatafullAssertFalsy extends DatafullAssertBase {
  result: false
}

export type DatafullAssertTruthy<T extends object = {}> = { result: true } & T; 

export type DatafullAssert<T extends object = {}> = DatafullAssertFalsy | DatafullAssertTruthy<T>;

export interface PrimitiveObject {
  [key: string]: Primitive | undefined
}

export type Literal<T extends Primitive> =
  T extends string ? t.StringLiteral :
  T extends number ? t.NumericLiteral :
  T extends boolean ? t.BooleanLiteral :
  T extends null ? t.NullLiteral :
  unknown

export type AnyFunctionExpression = t.FunctionExpression | t.ArrowFunctionExpression;