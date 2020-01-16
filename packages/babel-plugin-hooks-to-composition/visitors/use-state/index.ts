import { transform } from '@babel/core';
import { PluginHandler } from '../../types';
import { PluginPartial, Node } from '../../types';
import { Identifier, ArrayPattern, Expression } from 'babel-types';
import * as t from 'babel-types';
import {
  VUE_STATE_FUNC_NAME,
  REACT_STATE_FUNC_NAME,
  REACT_STATE_SETTER_PREFIX,
  REACT_USE_STATE,
} from '../../consts';
import { Visitor } from 'babel-traverse';
import {
  createVueRef,
  createReactUseRef,
  createVueReactive,
  isSetStateCallback,
  isCorrectStateSetterName,
  createAssignment,
} from '../../helpers';
import { refSet } from '../use-ref';

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

const replaceUseStateWithReactiveOrRef = (): Visitor => ({
  CallExpression(path) {
    const isUseStateFunc =
      t.isIdentifier(path.node.callee) &&
      path.node.callee.name === REACT_USE_STATE;

    if (!isUseStateFunc) return;

    if (t.isIdentifier(path.node.callee)) {
      // useState(initialState)
      const [initialState] = path.node.arguments;

      const isStateNotPrimiviteType =
        t.isObjectExpression(initialState) ||
        t.isArrayExpression(initialState);
      
      if (isStateNotPrimiviteType) {
        const vueReactive = createVueReactive(initialState);
        return path.replaceWith(vueReactive);
      } else {
        const reactUseState = createReactUseRef(initialState);
        // TRACK: vue ref declaration
        // refSet.set(path.node.)
        return path.replaceWith(reactUseState);
      }
    }
  },
});

const trackStateDeclarations = (): Visitor => ({
  VariableDeclarator(path) {
    const { id } = path.node;

    if (!t.isArrayPattern(id)) return;

    const [stateValue, stateSetter] = id.elements;

    if (!t.isIdentifier(stateValue)) return;
    if (!t.isIdentifier(stateSetter)) return;
    if (!isCorrectStateSetterName(stateSetter.name)) return;

    stateDeclarationsMap.set(stateSetter.name, stateValue.name);

    console.log(stateDeclarationsMap);
  }
});

/**
 * Replaces `setState(c => c + 1)` with `counter + 1`
 */
const replaceSetStateCallWithRawExpression = (): Visitor => ({
  CallExpression(path) {
    const { callee, arguments: args } = path.node;

    if (!t.isIdentifier(callee)) return;
    if (!isCorrectStateSetterName(callee.name)) return;
    if (!stateDeclarationsMap.has(callee.name)) return;

    const stateValueName = stateDeclarationsMap.get(callee.name);

    if (!stateValueName) return;

    // setState(1) or setState(c => c + 1)
    const [setStateArg] = args;

    switch(setStateArg.type) {
      // setState(variable)
      case 'Identifier':
        const stateAssignment = createAssignment(
          stateValueName as string,
          setStateArg,
        );
        return path.replaceWith(stateAssignment);
    }

    if (isSetStateCallback(setStateArg)) {
      const { body } = setStateArg;

      if (!stateValueName) return;
      if (!t.isBinaryExpression(body)) return;
      if (!t.isIdentifier(body.left)) return;

      if (t.isBinaryExpression(body)) {
        // changed name of variable to delcared by state
        const updatedBinaryExpression = t.binaryExpression(
          body.operator,
          t.identifier(stateValueName as string),
          body.right
        );
  
        path.replaceWith(updatedBinaryExpression);
      }
    } else if (t.isBinaryExpression(setStateArg)) {
      // just a binary expression, can be simply replaced
      path.replaceWith(setStateArg);
    }
  },
})

/**
 * Transforms React's `useState` to Vue's `reactive` state declaration:
 * `const [counter, setCounter] = useState(0);` transforms into
 * `const counter = reactive(0);`
 */
const replaceUseStateWithReactive = (): Visitor => ({
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
  // replaceUseStateWithReactive,
  replaceUseStateWithReactiveOrRef,
  replaceSetStateCallWithRawExpression,
  trackStateDeclarations,
];