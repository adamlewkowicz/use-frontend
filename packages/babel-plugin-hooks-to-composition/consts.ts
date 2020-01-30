import { DatafullAssertFalsy } from './types';

// React
export const REACT_STATE_SETTER_PREFIX = 'set' as const;
export const REACT_USE_STATE = 'useState' as const;
export const REACT_USE_MEMO = 'useMemo' as const;
export const REACT_USE_CALLBACK = 'useCallback' as const;
export const REACT_USE_EFFECT = 'useEffect' as const;
export const REACT_USE_REF = 'useRef' as const;
export const REACT_REF_PROPERTY = 'current' as const;
export const REACT_USE_CONTEXT = 'useContext' as const;
export const REACT_USE_LAYOUT_EFFECT = 'useLayoutEffect' as const;

// Vue
export const VUE_COMPUTED = 'computed' as const;
export const VUE_REF = 'ref' as const;
export const VUE_REF_PROPERTY = 'value' as const;
export const VUE_REACTIVE = 'reactive' as const;
export const VUE_ON_UPDATED = 'onUpdated' as const;
export const VUE_ON_MOUNTED = 'onMounted' as const;
export const VUE_ON_UNMOUNTED = 'onUnmounted' as const;
export const VUE_WATCH = 'watch' as const;
export const VUE_INJECT = 'inject' as const;
export const VUE_ON_BEFORE_MOUNT = 'onBeforeMount' as const;
export const VUE_ON_CLEANUP = 'onCleanup' as const;
export const VUE_PREV = 'prev' as const;

// common
export const ASSERT_FALSE: DatafullAssertFalsy = false;