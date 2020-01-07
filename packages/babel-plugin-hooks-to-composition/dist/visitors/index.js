"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const use_ref_1 = require("./use-ref");
exports.rootVisitor = utils_1.combineVisitors(...use_ref_1.useRefVisitors);
