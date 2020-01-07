"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("babel-types"));
const helpers_1 = require("../../helpers");
const consts_1 = require("../../consts");
exports.useMemoPlugin = (babel) => ({
    visitor: {
        CallExpression(path) {
            const { node } = path;
            if (!helpers_1.isUseMemoFunc(node.callee))
                return;
            const [callbackToMemoize] = node.arguments;
            if (!t.isArrowFunctionExpression(callbackToMemoize))
                return;
            const newIdentifier = t.identifier(consts_1.VUE_COMPUTED);
            path.replaceWith(t.callExpression(newIdentifier, [callbackToMemoize]));
        }
    }
});
