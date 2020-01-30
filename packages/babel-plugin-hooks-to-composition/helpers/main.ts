import * as t from 'babel-types';
import {
  REACT_STATE_SETTER_PREFIX,
  REACT_USE_STATE,
  ASSERT_FALSE,
} from '../consts';
import { DatafullAssert } from '../types';

const isUseStateFunc = (exp: t.Expression): DatafullAssert<{
  initialStateValue: t.Expression | t.SpreadElement
}> => {
  if (!t.isCallExpression(exp)) return ASSERT_FALSE;
  if (!t.isIdentifier(exp.callee)) return ASSERT_FALSE;

  const [initialStateValue] = exp.arguments;

  const isNotCalledUseState = exp.callee.name !== REACT_USE_STATE;
  const isNoInitialStateValue = initialStateValue === undefined;

  if (isNotCalledUseState) return ASSERT_FALSE;
  if (isNoInitialStateValue) return ASSERT_FALSE;

  return { initialStateValue };
}

export const isCorrectReactStateSetterName = (name: string): boolean => name.startsWith(REACT_STATE_SETTER_PREFIX);

/** is `[counter, setCounter]` */
const isReactStateDeclarationArray = (id: t.LVal): DatafullAssert<{
  stateValue: t.Identifier,
  stateSetter: t.Identifier,
}> => {
  if (!t.isArrayPattern(id)) return ASSERT_FALSE;

  const [stateValue, stateSetter] = id.elements;

  if (!t.isIdentifier(stateValue)) return ASSERT_FALSE;
  if (!t.isIdentifier(stateSetter)) return ASSERT_FALSE;
  if (!isCorrectReactStateSetterName(stateSetter.name)) return ASSERT_FALSE;

  return { stateValue, stateSetter };
}

/** is `[counter, setCounter] = useState(0)` */
export const isReactStateDeclarator = (declarator: t.VariableDeclarator): DatafullAssert<{
  initialStateValue: t.Expression | t.SpreadElement,
  stateValue: t.Identifier,
  stateSetter: t.Identifier,
}> => {
  const arrayDeclarationInfo = isReactStateDeclarationArray(declarator.id);
  const useStateInfo = isUseStateFunc(declarator.init);

  if (!useStateInfo) return ASSERT_FALSE;
  if (!arrayDeclarationInfo) return ASSERT_FALSE;

  const { initialStateValue } = useStateInfo;
  const { stateSetter, stateValue } = arrayDeclarationInfo;

  return {
    initialStateValue,
    stateValue,
    stateSetter,
  };
}