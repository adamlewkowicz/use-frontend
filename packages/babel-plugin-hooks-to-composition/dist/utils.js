"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const babel = __importStar(require("@babel/core"));
exports.mountPluginTester = (...plugins) => (code) => {
    var _a, _b;
    const result = babel.transform(code, { plugins, retainLines: true });
    if (((_a = result) === null || _a === void 0 ? void 0 : _a.code) == null) {
        throw new Error(`Could not transform code properly: "${(_b = result) === null || _b === void 0 ? void 0 : _b.code}"`);
    }
    return result.code;
};
exports.testVisitors = (...visitors) => {
    const plugin = {
        visitor: exports.combineVisitors(...visitors)
    };
    const pluginTester = exports.mountPluginTester(plugin);
    return (code) => pluginTester(code);
};
const BABEL_PLACEHOLDER = null; // TODO: provide babel arg
const createVisitorMap = (...visitorHandlers) => {
    return visitorHandlers.reduce((visitorMap, visitor) => {
        const entries = Object.entries(visitor(BABEL_PLACEHOLDER));
        entries.forEach(([property, handler]) => {
            var _a;
            if (!visitorMap[property]) {
                visitorMap[property] = [];
            }
            (_a = visitorMap[property]) === null || _a === void 0 ? void 0 : _a.push(handler);
        });
        return visitorMap;
    }, {});
};
exports.combineVisitors = (...visitors) => {
    const visitorMap = createVisitorMap(...visitors);
    const visitorMapEntries = Object.entries(visitorMap);
    const rootVisitor = visitorMapEntries.reduce((rootVisitor, [property, handlers]) => {
        function rootPropertyHandler(path, state) {
            handlers.forEach((handler) => {
                const handlerType = typeof handler;
                if (handlerType === 'function') {
                    return handler(path, state);
                }
                else {
                    throw new Error('Visitor entries may only be a type of function, ' +
                        'when using with "combine visitors" utility. \n' +
                        `Current type: "${handlerType}".`);
                }
            });
        }
        return {
            ...rootVisitor,
            [property]: rootPropertyHandler
        };
    }, {});
    return rootVisitor;
};
