import * as BabelTypes from 'babel-types';
import { Visitor } from 'babel-traverse';
import { NodePath } from '@babel/core';
interface Babel {
    types: typeof BabelTypes;
}
export declare type PluginHandler = (babel: Babel) => {
    name?: string;
    visitor: Visitor;
};
export declare type PluginPartial = (babel: Babel) => Visitor;
export { PluginPartial as VisitorHandler };
export declare type Node<N> = NodePath<N>['node'];
