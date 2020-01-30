import * as t from 'babel-types';
import { ASSERT_FALSE } from '../consts';
import { DatafullAssert } from '../types';

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
  if (!isExpressionsOfIdentifier(node.elements)) return ASSERT_FALSE;

  return {
    result: true,
    elements: node.elements,
  };
}