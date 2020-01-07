import * as babel from '@babel/core';
import { VisitorHandler } from './types';
import { Visitor } from 'babel-traverse';
export declare const mountPluginTester: (...plugins: babel.PluginItem[]) => (code: string) => string;
export declare const testVisitors: (...visitors: VisitorHandler[]) => (code: string) => string;
export declare const combineVisitors: (...visitors: VisitorHandler[]) => Visitor<import("babel-types").Node>;
