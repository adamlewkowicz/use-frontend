"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("babel-types"));
const consts_1 = require("./consts");
/** useMemo(...) */
exports.isUseMemoFunc = (exp) => t.isIdentifier(exp) && exp.name === consts_1.REACT_USE_MEMO;
/** useCallback(...) */
exports.isUseCallbackFunc = (exp) => t.isIdentifier(exp) && exp.name === consts_1.REACT_USE_CALLBACK;
/** useEffect(...) */
exports.isUseEffectFunc = (exp) => t.isIdentifier(exp) && exp.name === consts_1.REACT_USE_EFFECT;
/** useRef(...) */
exports.isUseRefFunc = (exp) => t.isIdentifier(exp) && exp.name === consts_1.REACT_USE_REF;
