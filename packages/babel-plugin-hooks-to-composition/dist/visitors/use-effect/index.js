"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../helpers");
const t = __importStar(require("babel-types"));
exports.useEffectPlugin = (babel) => ({
    visitor: {
        CallExpression(path) {
            const { node } = path;
            if (!helpers_1.isUseEffectFunc(node.callee))
                return;
            const [callback, dependencies] = node.arguments;
            if (!t.isArrowFunctionExpression(callback))
                return;
            if (t.isArrayExpression(dependencies) &&
                dependencies.elements.length !== 0) {
            }
        }
    }
});
