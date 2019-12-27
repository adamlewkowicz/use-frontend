import * as babel from '@babel/core';
import { PluginHandler } from '.';

export const useStatePlugin: PluginHandler = (babel) => ({
  visitor: {
    CallExpression(path) {
      const { callee, arguments: args } = path.node;
      const [setStateArg] = args;
      const isSetStateCall =
        callee.type === 'Identifier' &&
        callee.name.startsWith('set');

      if (isSetStateCall && setStateArg) {
        if (setStateArg.type === 'BinaryExpression') {
          path.replaceWith(setStateArg);
        } else if (setStateArg.type === 'ArrowFunctionExpression') {
          // TODO
          path.replaceWith(setStateArg.body);
        }
      }
    },
    Identifier(path) {
      if (path.node.name === 'useState') {
        const useRefIdentifier = babel.types.identifier('reactive');
        path.replaceWith(useRefIdentifier);
      }
    },
    ArrayPattern(path) {
      if (path.node.elements.length === 2) {
        const [firstExpression] = path.node.elements;
        if (firstExpression.type === 'Identifier') {
          const variableIdentifier = babel.types.identifier(firstExpression.name);
          path.replaceWith(variableIdentifier);
        }
      }
    },
  }
});

let result = babel.transform(
  `
    const [counter, setCounter] = useState(0);

    setCounter(counter + 1);

    // unable to handle this sort of calls (can't detect variable that it relies on)
    setCounter(counter => counter + 1);
  `,
  { plugins: [useStatePlugin] }
);

console.log(result.code);