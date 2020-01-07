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
const consts_1 = require("../../consts");
exports.useCallbackPlugin = () => ({
    visitor: {
        CallExpression(path) {
            const { node } = path;
            if (!helpers_1.isUseCallbackFunc(node.callee))
                return;
            const [callbackToMemoize] = node.arguments;
            if (!t.isArrowFunctionExpression(callbackToMemoize))
                return;
            const computedCallbackWrapper = t.arrowFunctionExpression([], callbackToMemoize);
            const memoizedComputed = t.callExpression(t.identifier(consts_1.VUE_COMPUTED), [computedCallbackWrapper]);
            path.replaceWith(memoizedComputed);
        }
    }
});
