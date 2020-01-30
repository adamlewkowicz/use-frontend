import { Visitor } from 'babel-traverse';
import { createVueInjectCallExp } from '../../helpers';
import { isReactUseContextCallExp } from '../../assert';

const replaceUseContextWithInject = (): Visitor => ({
  CallExpression(path) {
    if (!isReactUseContextCallExp(path.node)) return;

    const vueInjectCallExp = createVueInjectCallExp(path.node.arguments);

    path.replaceWith(vueInjectCallExp);
  }
});

export const useContextVisitors = [
  replaceUseContextWithInject,
];