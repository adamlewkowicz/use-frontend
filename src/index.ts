import * as babylon from 'babylon';
import traverse, { Visitor } from 'babel-traverse';
import * as babel from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import * as BabelTypes from 'babel-types';

let result;

interface Babel {
  types: typeof BabelTypes;
}

export type PluginHandler = (babel: Babel) => {
  name?: string
  visitor: Visitor
}

result = babylon.parse(`
  const a = 4;
`);

/**
 * @example
*     onUnmounted(() => {
        window.removeEventListener('mousemove', update)
      })
 */
const useEffectPlugin: PluginHandler = (babel) => ({
  visitor: {
    CallExpression(path) {
      const { callee } = path.node;
      const isUseEffect = callee.type === 'Identifier' &&
        callee.name === 'useEffect';

      if (isUseEffect) {
        const [callback, dependencies] = path.node.arguments;

        const watchCallExpression = babel.types.callExpression(
          babel.types.identifier('watch'),
          [
            dependencies || babel.types.arrayExpression(),
            callback
          ]
        );

        if (
          callback.type === 'ArrowFunctionExpression' &&
          callback.body.type === 'BlockStatement'
        ) {
          const returnStatement = callback.body.body.find(
            element => element.type === 'ReturnStatement'
          );

          const isCleanupCallback = returnStatement &&
            returnStatement.type === 'ReturnStatement' &&
            returnStatement.argument.type === 'ArrowFunctionExpression';

          if (isCleanupCallback) {
            // callback.body.replac
          }
        }

        path.replaceWith(watchCallExpression);
      }
    }
  }
});

result = babel.transform(
  ` 
    const [counter, setCounter] = useState(0);

    useEffect(() => {

    }, [counter]);
  `,
  { plugins: [useEffectPlugin] }
);