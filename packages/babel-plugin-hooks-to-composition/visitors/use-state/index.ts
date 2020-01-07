import { transform } from '@babel/core';
import { PluginHandler } from '../../types';
import { PluginPartial, Node } from '../../types';
import { Identifier, ArrayPattern, Expression } from 'babel-types';
import * as t from 'babel-types';
import {
  VUE_STATE_FUNC_NAME,
  REACT_STATE_FUNC_NAME,
  REACT_STATE_SETTER_PREFIX,
} from '../../consts';
import { Visitor } from 'babel-traverse';

/** useState(...) */
const isUseStateFunc = (node: Node<Identifier>): boolean => node.name === REACT_STATE_FUNC_NAME;

/** setCounter */
const isUseStateSetter = (exp: Expression): exp is Identifier => t.isIdentifier(exp) && exp.name.startsWith(REACT_STATE_SETTER_PREFIX);

/** [counter, setCounter] */
const isUseStateDestructuring = (node: Node<ArrayPattern>): boolean => {
  const hasTwoElements = node.elements.length === 2;
  const [stateValue, stateSetter] = node.elements;

  if (!hasTwoElements) return false;
  if (!t.isIdentifier(stateValue)) return false;
  if (!isUseStateSetter(stateSetter)) return false;

  // stateSetter.name === `set${stateValue.name[0].toUpperCase() + stateValue.name.substring(-1)}`

  return true;
}

interface StateValueName extends String {}
interface StateSetterName extends String {}

let stateDeclarationsSet = new Set<StateValueName>();
let stateDeclarationsMap = new Map<StateSetterName, StateValueName>();

export const useStatePlugin: PluginHandler = (babel) => ({
  visitor: {
    CallExpression(path) {
      const { callee, arguments: args } = path.node;
      const [setStateArg] = args;

      if (isUseStateSetter(callee) && setStateArg) {
        if (setStateArg.type === 'BinaryExpression') {
          path.replaceWith(setStateArg);
        } else if (setStateArg.type === 'ArrowFunctionExpression') {
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
        const vueStateFuncName = t.identifier(VUE_STATE_FUNC_NAME);
        path.replaceWith(vueStateFuncName);
      }
    },
    ArrayPattern(path) {
      const { node } = path;
      const hasTwoElements = node.elements.length === 2;
      const [stateValue, stateSetter] = node.elements;
    
      if (!hasTwoElements) return;
      if (!t.isIdentifier(stateValue)) return;
      if (!isUseStateSetter(stateSetter)) return;

      const setterNameByPattern = 
        REACT_STATE_SETTER_PREFIX +
        stateValue.name.charAt(0).toUpperCase() +
        stateValue.name.substring(1);

      const isCorrectSetterName = stateSetter.name === setterNameByPattern;

      if (!isCorrectSetterName) return;

      // track state delcarations
      stateDeclarationsSet.add(stateValue.name as StateValueName);
      stateDeclarationsMap.set(
        stateSetter.name as StateSetterName,
        stateValue.name as StateValueName
      );

      const variableIdentifier = t.identifier(stateValue.name);
      path.replaceWith(variableIdentifier);
    },
  }
});

/**
 * Transforms React's `useState` to Vue's `reactive` state declaration:
 * `const [counter, setCounter] = useState(0);` transforms into
 * `const counter = reactive(0);`
 */
const replaceUseStateWithReactive = (): Visitor => ({
  Identifier(path) {
    if (path.node.name === 'useState') {
      const useRefIdentifier = t.identifier('reactive');
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

export const useStateVisitors = [
  replaceUseStateWithReactive,
];