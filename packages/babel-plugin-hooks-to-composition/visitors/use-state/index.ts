import * as t from 'babel-types';
import { Visitor } from 'babel-traverse';
import {
  createAssignment,
  createVueReactiveDeclarator,
  createVueRefDeclarator,
  createVueRefValueAssignment,
  createVueRefMemberExp,
} from '../../helpers';
import {
  isReactSetStateCall,
  isReactStateDeclarator,
  isAnyFunctionExpression,
} from '../../assert';

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

/**
 * Replaces `setState(c => c + 1)` with `counter + 1`
 */
const replaceSetStateCallWithRawExpression = (): Visitor => ({
  CallExpression(path) {
    const isReactSetStateCallInfo = isReactSetStateCall(path.node);

    if (!isReactSetStateCallInfo) return;

    const { setStateArg, stateValueName, stateDeclarationInfo } = isReactSetStateCallInfo;

    const isVueRef = stateDeclarationInfo.type === 'vue_ref';
    const createIdentifierOrMemberHandler = isVueRef ? createVueRefMemberExp : t.identifier;

    const createAssignmentHandler = isVueRef
      ? createVueRefValueAssignment
      : createAssignment;

    if (isAnyFunctionExpression(setStateArg)) {
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

    } else if (!t.isSpreadElement(setStateArg)) {
      const stateValueAssignment = createAssignmentHandler(
        stateValueName as string,
        setStateArg
      );
      return path.replaceWith(stateValueAssignment);
    }
  },
})

export const useStateVisitors = [
  replaceUseStateWithReactiveOrRef,
  replaceSetStateCallWithRawExpression,
];