import * as t from 'babel-types';
import { Primitive, PrimitiveObject } from '../types';

const createLiteral = <T extends Primitive>(literal: T): BabelLiteral => {
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

const createObjectProperty = <T extends Primitive>(
  propertyName: string,
  value: T
): t.ObjectProperty => t.objectProperty(
  t.identifier(propertyName),
  createLiteral(value),
);

export const createObjectExpression = <T extends PrimitiveObject>(
  obj: T
): t.ObjectExpression => {

  const objectProperties = Object
    .entries(obj)
    .filter((entry): entry is [string, Primitive] => {
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