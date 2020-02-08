import * as t from 'babel-types';
import { Visitor } from 'babel-traverse';
import {
  createAssignment,
  createVueReactiveDeclarator,
  createVueRefDeclarator,
  createVueRefValueAssignment,
  createVueRefMemberExp,
} from '../../helpers';
import { isReactSetStateCall, isReactStateDeclarator } from '../../assert';

interface StateValueName extends String {}
interface StateSetterName extends String {}

export interface StateDeclarationInfo {
  type: 'vue_reactive' | 'vue_ref'
  stateValueName: StateValueName
}

export const stateDeclarationsMap = new Map<StateSetterName, StateDeclarationInfo>();

const replaceUseStateWithReactiveOrRef = (): Visitor => ({
  
  // [counter, setCounter] = useState(0);
  VariableDeclarator(path) {
    const stateDeclarationInfo = isReactStateDeclarator(path.node);

    if (!stateDeclarationInfo) return;
    
    const {
      stateValue,
      stateSetter,
      initialStateValue,
      initialStateValueType,
    } = stateDeclarationInfo;

    const stateValueName = stateValue.name;
    const stateSetterName = stateSetter.name;

    if (initialStateValueType === 'primitive') {
      // replace with React's useRef to make use-ref visitors do the job
      // with replacing .current to .value
      const vueRefDeclarator = createVueRefDeclarator(
        stateValueName,
        initialStateValue
      );

      stateDeclarationsMap.set(stateSetterName, { type: 'vue_ref', stateValueName });

      return path.replaceWith(vueRefDeclarator);

    } else {
      const vueReactiveDeclarator = createVueReactiveDeclarator(
        stateValueName,
        initialStateValue,
      );

      stateDeclarationsMap.set(stateSetterName, { type: 'vue_reactive', stateValueName });

      return path.replaceWith(vueReactiveDeclarator);
    }
  },
});

let visitedIdentifiers = new Set<string>();

/**
 * Replaces `setState(c => c + 1)` with `counter + 1`
 */
const replaceSetStateCallWithRawExpression = (): Visitor => ({
  Expression(path) {
    if (!t.isIdentifier(path.node)) return;
    if (t.isVariableDeclarator(path.parent)) return;
    if (t.isCallExpression(path.parent)) return;

    const { node } = path;
    const { name } = path.node;

    if (visitedIdentifiers.has(node.name)) return;

    const info = [...stateDeclarationsMap]
      // .map(([setterName, info]) => info)
      .find(([setterName, info]) => info.stateValueName === name);

    if (!info) return;

    // const updatedName = info[1].stateValueName as string;

    // if (visitedIdentifiers.has(updatedName)) return;

    // path.replaceWith(createVueRefMemberExp(node.name));

    path.replaceWith(t.identifier('ABC'))

    // visitedIdentifiers.add(node.name);
    // visitedIdentifiers.add(updatedName);

    console.log(node.name, path, info)
  },
  CallExpression(path) {
    const isReactSetStateCallInfo = isReactSetStateCall(path.node);

    if (!isReactSetStateCallInfo) return;

    const { setStateArg, stateValueName, stateDeclarationInfo } = isReactSetStateCallInfo;

    const isVueRef = stateDeclarationInfo.type === 'vue_ref';
    const createIdentifierOrMemberHandler = isVueRef ? createVueRefMemberExp : t.identifier;

    const createAssignmentHandler = isVueRef
      ? createVueRefValueAssignment
      : createAssignment;

    switch(setStateArg.type) {
      // setCounter(nextCounter / 4 / null / false / [...abc] / counter + 1 / 'abc' / abc.toString() / {} / event.value)
      case 'Identifier':
      case 'NumericLiteral':
      case 'NullLiteral':
      case 'BooleanLiteral':
      case 'ArrayExpression':
      case 'BinaryExpression':
      case 'StringLiteral':
      case 'CallExpression':
      case 'ObjectExpression':
      case 'MemberExpression':
        const stateValueAssignment = createAssignmentHandler(
          stateValueName as string,
          setStateArg
        );
        return path.replaceWith(stateValueAssignment);

      case 'ArrowFunctionExpression': {
        const { body } = setStateArg;

        // is setState(v => v)
        if (t.isIdentifier(body)) {
          const stateValueAssignment = createAssignmentHandler(
            stateValueName as string,
            createIdentifierOrMemberHandler(stateValueName)
          );
          return path.replaceWith(stateValueAssignment);
        }

        if (!t.isBinaryExpression(body)) return;
        if (!t.isIdentifier(body.left)) return;

        // changed name of variable to delcared by state
        const updatedBinaryExpression = t.binaryExpression(
          body.operator,
          createIdentifierOrMemberHandler(stateValueName),
          body.right
        );

        const stateValueAssignment = createAssignmentHandler(
          stateValueName as string,
          updatedBinaryExpression,
        );
  
        return path.replaceWith(stateValueAssignment);
      }
    }
  },
})

export const useStateVisitors = [
  replaceUseStateWithReactiveOrRef,
  replaceSetStateCallWithRawExpression,
];