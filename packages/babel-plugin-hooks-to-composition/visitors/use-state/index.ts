import * as t from 'babel-types';
import { Visitor } from 'babel-traverse';
import {
  isSetStateCallback,
  isCorrectStateSetterName,
  createAssignment,
  isReactStateDeclarator,
  createVueReactiveDeclarator,
  createReactUseRefDeclarator,
} from '../../helpers';

interface StateValueName extends String {}
interface StateSetterName extends String {}

let stateDeclarationsMap = new Map<StateSetterName, StateValueName>();

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