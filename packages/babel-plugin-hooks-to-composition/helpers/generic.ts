import * as t from 'babel-types';
import {
  Primitive,
  PrimitiveObject,
  Literal,
  AnyFunctionExpression,
  ExpOrSpread,
} from '../types';
import { InitialState } from './types';

const createLiteral = <T extends Primitive>(literal: T): Literal<T> => {
  if (literal === null) {
    return t.nullLiteral() as Literal<T>;
  }

  switch (typeof literal) {
    case 'number':
      return t.numericLiteral(literal) as Literal<T>;
    case 'string':
      return t.stringLiteral(literal) as Literal<T>;
    case 'boolean':
      return t.booleanLiteral(literal) as Literal<T>;
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

/** functionName(...deps) */
export const createCallExp = (
  functionName: string,
  args: ExpOrSpread[]
): t.CallExpression => t.callExpression(
  t.identifier(functionName),
  args
);

/** Higher order function for creating generic call expressions  */
export const createGenericCallExp = <T extends ExpOrSpread | ExpOrSpread[] = ExpOrSpread>(
  functionName: string,
) => (
  argOrArgs: T
): t.CallExpression => {
  const args = Array.isArray(argOrArgs) ? argOrArgs : [argOrArgs] as ExpOrSpread[];
  return createCallExp(functionName, args);
}

export const createInitialStateCallExp = (
  functionName: string
) => (
  initialState: InitialState
): t.CallExpression => createCallExp(functionName, [initialState]);

export const createCallbackCallExp = (
  functionName: string
) => (
  callback: AnyFunctionExpression
): t.CallExpression => createCallExp(functionName, [callback]);

export const updateArrowFunctionBody = <T extends AnyFunctionExpression>(
  func: T,
  callback: (statements: t.Statement[]) => t.Statement[]
): T => {
  if (!t.isBlockStatement(func.body)) {
    throw new Error;
  }
  return t.arrowFunctionExpression(
    func.params,
    updateBodyOfBlockStatement(func.body, callback),
  ) as T;
}

const updateBodyOfBlockStatement = (
  blockStatement: t.BlockStatement,
  callback: (statements: t.BlockStatement['body']) => t.BlockStatement['body']
): t.BlockStatement => {
  return t.blockStatement(
    callback(blockStatement.body),
    blockStatement.directives
  );
}

const removeStatementFromFunction = <
  S extends t.Statement,
  T extends AnyFunctionExpression,
>(
  func: T,
  statementType: S['type'],
): {
  updatedFunction: T,
  removedStatement?: S
} => {
  let removedStatement: S | undefined;

  // TODO: refactor to pure function
  const updatedFunction = updateArrowFunctionBody(func, (statements) => {
    removedStatement = statements.find(
      (statement): statement is S => statement.type === statementType
    );

    if (removedStatement) {
      return statements.filter(
        statement => statement.type !== statementType
      );
    }
    return statements;
  });

  return {
    updatedFunction,
    removedStatement,
  }
}

export const removeReturnStatementFromFunction = <T extends AnyFunctionExpression>(
  func: T
): {
  updatedFunction: T,
  removedStatement?: t.ReturnStatement,
} => removeStatementFromFunction<t.ReturnStatement, T>(func, 'ReturnStatement');

/** variableName = expression; */
export const createAssignment = (
  variableName: string,
  expression: t.Expression,
): t.AssignmentExpression => {
  return t.assignmentExpression(
    '=',
    t.identifier(variableName),
    expression
  );
}