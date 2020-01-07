import * as t from 'babel-types';
/** useMemo(...) */
export declare const isUseMemoFunc: (exp: t.Expression) => exp is t.Identifier;
/** useCallback(...) */
export declare const isUseCallbackFunc: (exp: t.Expression) => exp is t.Identifier;
/** useEffect(...) */
export declare const isUseEffectFunc: (exp: t.Expression) => exp is t.Identifier;
/** useRef(...) */
export declare const isUseRefFunc: (exp: t.Expression) => exp is t.Identifier;
