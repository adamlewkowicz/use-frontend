
import { isUseRefFunc } from '../../helpers';
import * as t from 'babel-types';
import {
  VUE_REF,
  REACT_REF_PROPERTY,
  VUE_REF_PROPERTY,
} from '../../consts';
import { combineVisitors } from '../../utils';
import { Visitor } from 'babel-traverse';

let refSet = new Set();

/** useRef() -> ref() */
const replaceUseRefWithRef = (): Visitor => ({
  CallExpression(path) {

    if (!isUseRefFunc(path.node.callee)) return;

    const newFuncDeclaration = t.callExpression(
      t.identifier(VUE_REF),
      path.node.arguments
    );
  
    path.replaceWith(newFuncDeclaration);
  }
});

/** foo.current -> foo.value */
const replaceDotCurrentWithDotValue = (): Visitor => ({
  MemberExpression(path) {
    const { object, property } = path.node;

    if (!t.isIdentifier(object)) return;
    if (!t.isIdentifier(property)) return;
    if (property.name !== REACT_REF_PROPERTY) return;
    if (!refSet.has(object.name)) return;

    const vueRefProperty = t.memberExpression(
      object,
      t.identifier(VUE_REF_PROPERTY)
    );

    path.replaceWith(vueRefProperty);
  },
  // tracks ".values" declarations
  VariableDeclarator(path) {
    if (!t.isIdentifier(path.node.id)) return;
    if (!t.isCallExpression(path.node.init)) return;
    if (!isUseRefFunc(path.node.init.callee)) return;

    const { name } = path.node.id;

    if (!refSet.has(name)) {
      refSet.add(name);
    }
  }
});

export const useRefVisitors = [
  replaceUseRefWithRef,
  replaceDotCurrentWithDotValue,
];

export const useRefPlugin = {
  visitor: combineVisitors(...useRefVisitors)
}