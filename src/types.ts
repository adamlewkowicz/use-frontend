import * as BabelTypes from 'babel-types';
import { Visitor } from 'babel-traverse';

interface Babel {
  types: typeof BabelTypes;
}

export type PluginHandler = (babel: Babel) => {
  name?: string
  visitor: Visitor
}

export type PluginPartial = (babel: Babel) => Visitor;