import { ASSERT_FALSE } from '../consts';
import {
  t,
  DatafullAssert,
  ExpOrSpread,
  AnyFunctionExpression,
} from '../types';

const isExpressionsOfType = <T extends t.Expression>(
  expressions: (t.Expression | null | t.SpreadElement)[],
  expressionType: T['type']
): expressions is T[] => expressions.every(exp => exp !== null && exp.type === expressionType);

const isExpressionsOfIdentifier = (
  expressions: (t.Expression | null | t.SpreadElement)[]
): expressions is t.Identifier[] => isExpressionsOfType(expressions, 'Identifier');

/** is `[a, b]` - array of identifiers */
export const isArrayOfIdentifiers = (node: t.Expression | t.SpreadElement): DatafullAssert<{
  elements: t.Identifier[]
}> => {
  if (!t.isArrayExpression(node)) return ASSERT_FALSE;
  
  const { elements } = node;
  
  if (!isExpressionsOfIdentifier(elements)) return ASSERT_FALSE;

  return { elements };
}

export const isCallExpWithName = (
  functionName: string
) => (node: t.Expression): DatafullAssert<{
  callee: t.Identifier
  args: ExpOrSpread[]
}> => {
  if (!t.isCallExpression(node)) return ASSERT_FALSE;

  const { callee, arguments: args } = node;

  if (!t.isIdentifier(callee)) return ASSERT_FALSE;
  if (callee.name !== functionName) return ASSERT_FALSE;

  return { callee, args };
}

export const isAnyFunctionExpression = (
  node: ExpOrSpread
): node is AnyFunctionExpression => {
  if (
    t.isFunctionExpression(node) ||
    t.isArrowFunctionExpression(node)
  ) {
    return true;
  }
  return false;
}