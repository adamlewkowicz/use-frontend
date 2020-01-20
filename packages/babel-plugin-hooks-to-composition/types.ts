import * as BabelTypes from 'babel-types';
import { Visitor } from 'babel-traverse';
import { NodePath } from '@babel/core';

interface Babel {
  types: typeof BabelTypes;
}

export type Literal = number | string | boolean | null;

export type PluginHandler = (babel: Babel) => {
  name?: string
  visitor: Visitor
}

export type PluginPartial = (babel: Babel) => Visitor;
export { PluginPartial as VisitorHandler };

export type Node<N = BabelTypes.Node> = NodePath<N>['node'];

interface DatafullAssertBase {
  result: boolean
}
export interface DatafullAssertFalsy extends DatafullAssertBase {
  result: false
}

export type DatafullAssertTruthy<T extends object = {}> = { result: true } & T; 

export type DatafullAssert<T extends object = {}> = DatafullAssertFalsy | DatafullAssertTruthy<T>;

export interface LiteralObject {
  [key: string]: Literal | undefined
}