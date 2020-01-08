import { Visitor } from 'babel-traverse';
import { isUseContextFunc, createVueInject } from '../../helpers';

const replaceUseContextWithInject = (): Visitor => ({
  CallExpression(path) {
    if (!isUseContextFunc(path.node.callee)) return;

    const vueInject = createVueInject(path.node.arguments);

    path.replaceWith(vueInject);
  }
});

export const useContextVisitors = [
  replaceUseContextWithInject,
];