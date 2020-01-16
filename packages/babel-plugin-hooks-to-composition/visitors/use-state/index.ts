import { PluginHandler } from '../../types';
import { Node } from '../../types';
import { Identifier, ArrayPattern, Expression } from 'babel-types';
import * as t from 'babel-types';
import {
  VUE_STATE_FUNC_NAME,
  REACT_STATE_FUNC_NAME,
  REACT_STATE_SETTER_PREFIX,
} from '../../consts';
import { Visitor } from 'babel-traverse';
import {
  isSetStateCallback,
  isCorrectStateSetterName,
  createAssignment,
  isReactStateDeclarator,
  createVueReactiveDeclarator,
  createReactUseRefDeclarator,
} from '../../helpers';

/** useState(...) */
const isUseStateFunc = (node: Node<Identifier>): boolean => node.name === REACT_STATE_FUNC_NAME;

/** setCounter */
const isUseStateSetter = (exp: Expression): exp is Identifier => t.isIdentifier(exp) && exp.name.startsWith(REACT_STATE_SETTER_PREFIX);

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
  // [counter, setCounter] = useState(0);
  VariableDeclarator(path) {
    const stateDeclarationInfo = isReactStateDeclarator(path.node);

    if (!stateDeclarationInfo.result) return;
    
    const {
      stateValue,
      stateSetter,
      initialStateValue,
    } = stateDeclarationInfo;

    // TRACK STATE DECLARATIONS
    stateDeclarationsMap.set(stateSetter.name, stateValue.name);

    // state has primitive type
    if (t.isLiteral(initialStateValue)) {
      // replace with React's useRef to make use-ref visitors do the job
      // with replacing .current to .value
      const reactUseRefDeclarator = createReactUseRefDeclarator(
        stateValue.name,
        initialStateValue
      );

      return path.replaceWith(reactUseRefDeclarator);
    } else {
      const vueReactiveDeclarator = createVueReactiveDeclarator(
        stateValue.name,
        initialStateValue,
      );

      return path.replaceWith(vueReactiveDeclarator);
    }
  },
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

export const useStateVisitors = [
  replaceUseStateWithReactiveOrRef,
  replaceSetStateCallWithRawExpression,
];