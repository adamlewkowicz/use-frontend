"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@babel/core");
const t = __importStar(require("babel-types"));
const consts_1 = require("./consts");
/** useState(...) */
const isUseStateFunc = (node) => node.name === consts_1.REACT_STATE_FUNC_NAME;
/** setCounter */
const isUseStateSetter = (exp) => t.isIdentifier(exp) && exp.name.startsWith(consts_1.REACT_STATE_SETTER_PREFIX);
/** [counter, setCounter] */
const isUseStateDestructuring = (node) => {
    const hasTwoElements = node.elements.length === 2;
    const [stateValue, stateSetter] = node.elements;
    if (!hasTwoElements)
        return false;
    if (!t.isIdentifier(stateValue))
        return false;
    if (!isUseStateSetter(stateSetter))
        return false;
    // stateSetter.name === `set${stateValue.name[0].toUpperCase() + stateValue.name.substring(-1)}`
    return true;
};
/**
 * Transforms React's `useState` to Vue's `reactive` state declaration:
 * `const [counter, setCounter] = useState(0);` transforms into
 * `const counter = reactive(0);`
 */
const transformUseStateDeclaration = (babel) => ({
    Identifier(path) {
        if (path.node.name === 'useState') {
            const useRefIdentifier = babel.types.identifier('reactive');
            path.replaceWith(useRefIdentifier);
        }
    },
    ArrayPattern(path) {
        if (path.node.elements.length === 2) {
            const [firstExpression] = path.node.elements;
            if (firstExpression.type === 'Identifier') {
                // TODO: check if a second destructured variable starts with 'set___'
                // to make sure that it's set's state array 
                const variableIdentifier = t.identifier(firstExpression.name);
                path.replaceWith(variableIdentifier);
            }
        }
    },
});
let stateDeclarationsSet = new Set();
let stateDeclarationsMap = new Map();
exports.useStatePlugin = (babel) => ({
    visitor: {
        CallExpression(path) {
            const { callee, arguments: args } = path.node;
            const [setStateArg] = args;
            if (isUseStateSetter(callee) && setStateArg) {
                if (setStateArg.type === 'BinaryExpression') {
                    path.replaceWith(setStateArg);
                }
                else if (setStateArg.type === 'ArrowFunctionExpression') {
                    return;
                    // const stateValueName = stateDeclarationsMap.get(callee.name as StateSetterName);
                    // const [stateValueParam] = setStateArg.params;
                    // const isStateSetterDeclared = stateValueName === undefined;
                    // if (stateValueName === undefined) return;
                    // if (!t.isIdentifier(stateValueParam)) return;
                    // stateValueParam.name = 'abc';
                    // path.replaceWith(setStateArg.body);
                }
            }
        },
        Identifier(path) {
            if (isUseStateFunc(path.node)) {
                const vueStateFuncName = t.identifier(consts_1.VUE_STATE_FUNC_NAME);
                path.replaceWith(vueStateFuncName);
            }
        },
        ArrayPattern(path) {
            const { node } = path;
            const hasTwoElements = node.elements.length === 2;
            const [stateValue, stateSetter] = node.elements;
            if (!hasTwoElements)
                return;
            if (!t.isIdentifier(stateValue))
                return;
            if (!isUseStateSetter(stateSetter))
                return;
            const setterNameByPattern = consts_1.REACT_STATE_SETTER_PREFIX +
                stateValue.name.charAt(0).toUpperCase() +
                stateValue.name.substring(1);
            const isCorrectSetterName = stateSetter.name === setterNameByPattern;
            if (!isCorrectSetterName)
                return;
            // track state delcarations
            stateDeclarationsSet.add(stateValue.name);
            stateDeclarationsMap.set(stateSetter.name, stateValue.name);
            const variableIdentifier = t.identifier(stateValue.name);
            path.replaceWith(variableIdentifier);
        },
    }
});
/* POC
const plugin = combinePartials(
  transformUseStateDeclaration,
  ...
)
*/
let result = core_1.transform(`
    const [counter, setCounter] = useState(0);

    setCounter(counter + 1);

    // Unable to handle this sort of calls (can't detect variable that it relies on).
    // Check React's hooks eslint plugin to check how it detects hooks code.
    setCounter(counter => counter + 1);
  `, { plugins: [exports.useStatePlugin] });
console.log((_a = result) === null || _a === void 0 ? void 0 : _a.code);
