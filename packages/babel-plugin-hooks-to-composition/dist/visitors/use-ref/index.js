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
const utils_1 = require("../../utils");
let refSet = new Set();
/** useRef() -> ref() */
const replaceUseRefWithRef = () => ({
    CallExpression(path) {
        if (!helpers_1.isUseRefFunc(path.node.callee))
            return;
        const newFuncDeclaration = t.callExpression(t.identifier(consts_1.VUE_REF), path.node.arguments);
        path.replaceWith(newFuncDeclaration);
    }
});
/** foo.current -> foo.value */
const replaceCurrentWithValue = () => ({
    MemberExpression(path) {
        const { object, property } = path.node;
        if (!t.isIdentifier(object))
            return;
        if (!t.isIdentifier(property))
            return;
        if (property.name !== consts_1.REACT_REF_PROPERTY)
            return;
        if (!refSet.has(object.name))
            return;
        const vueRefProperty = t.memberExpression(object, t.identifier(consts_1.VUE_REF_PROPERTY));
        path.replaceWith(vueRefProperty);
    },
    // tracks ".values" declarations
    VariableDeclarator(path) {
        if (!t.isIdentifier(path.node.id))
            return;
        if (!t.isCallExpression(path.node.init))
            return;
        if (!helpers_1.isUseRefFunc(path.node.init.callee))
            return;
        refSet.add(path.node.id.name);
    }
});
exports.useRefVisitors = [
    replaceUseRefWithRef,
    replaceCurrentWithValue,
];
exports.useRefPlugin = {
    visitor: utils_1.combineVisitors(...exports.useRefVisitors)
};
