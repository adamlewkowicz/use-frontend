import * as t from 'babel-types';
import { Literal, LiteralObject } from '../types';

const createLiteral = <T extends Literal>(literal: T): BabelLiteral => {
  if (literal === null) {
    return t.nullLiteral();
  }

  switch (typeof literal) {
    case 'number':
      return t.numericLiteral(literal);
    case 'string':
      return t.stringLiteral(literal);
    case 'boolean':
      return t.booleanLiteral(literal);
    default:
      throw new Error(`Unhandled literal type ${literal}`);
  }
}

const createObjectProperty = <T extends Literal>(
  propertyName: string,
  value: T
): t.ObjectProperty => t.objectProperty(
  t.identifier(propertyName),
  createLiteral(value),
);

export const createObjectExpression = <T extends LiteralObject>(
  obj: T
): t.ObjectExpression => {

  const objectProperties = Object
    .entries(obj)
    .filter((entry): entry is [string, Literal] => {
      const [property, value] = entry;
      return value !== undefined;
    })
    .map(([property, value]) => createObjectProperty(property, value));

  const objectExpression = t.objectExpression(objectProperties);

  return objectExpression;
}

type BabelLiteral =
  | t.BooleanLiteral 
  | t.NullLiteral 
  | t.StringLiteral 
  | t.NumericLiteral