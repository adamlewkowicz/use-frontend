import * as BabelTypes from 'babel-types';
import { Visitor } from 'babel-traverse';
import { NodePath } from '@babel/core';

interface Babel {
  types: typeof BabelTypes;
}

export type PluginHandler = (babel: Babel) => {
  name?: string
  visitor: Visitor
}

export type PluginPartial = (babel: Babel) => Visitor;

export type Node<N> = NodePath<N>['node'];