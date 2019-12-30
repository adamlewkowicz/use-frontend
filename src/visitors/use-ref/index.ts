import { PluginHandler } from '../..';
import { isUseRefFunc } from '../../helpers';
import * as t from 'babel-types';
import {
  VUE_REF,
  REACT_REF_PROPERTY,
  VUE_REF_PROPERTY,
} from '../../consts';

let refSet = new Set();

export const useRefPlugin: PluginHandler = (babel) => ({
  visitor: {
    // replaces useRef() to ref()
    CallExpression(path) {

      if (!isUseRefFunc(path.node.callee)) return;

      const newFuncDeclaration = t.callExpression(
        t.identifier(VUE_REF),
        path.node.arguments
      );
    
      path.replaceWith(newFuncDeclaration);
    },
    // replaces .current with .value
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

      refSet.add(path.node.id.name);
    }
  },
  pre() {
  },
  post() {
  }
});