import { Visitor } from 'babel-traverse';
import { isUseContextFunc, createVueInjectCallExp } from '../../helpers';

const replaceUseContextWithInject = (): Visitor => ({
  CallExpression(path) {
    if (!isUseContextFunc(path.node.callee)) return;

    const vueInject = createVueInjectCallExp(path.node.arguments);

    path.replaceWith(vueInject);
  }
});

export const useContextVisitors = [
  replaceUseContextWithInject,
];