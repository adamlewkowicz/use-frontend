"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const visitors_1 = require("./visitors");
exports.hooksToCompositionPlugin = () => ({
    name: 'hooks-to-composition',
    visitor: visitors_1.rootVisitor
});
