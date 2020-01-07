import * as t from 'babel-types';
import { Visitor } from 'babel-traverse';
export declare const useRefVisitors: (() => Visitor<t.Node>)[];
export declare const useRefPlugin: {
    visitor: Visitor<t.Node>;
};
