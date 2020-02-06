# Use-Frontend
Transform React.js Hooks to Vue.js Composition Api


## TODO:
### useEffect
  - [x] remove cleanup callback from `onMounted`
  - [x] create `watch` if contains dependencies
  - [x] create `onMounted` if dependencies are empty
  - [x] create `onUpdated` if there are no dependencies
  - [x] if contains cleanup callback
    - [x] create `onMounted` hook
    - [x] remove return cleanup callback from original callback
    - [x] create additional `onUnmounted` lifecycle cleanup hook
### useRef
  - [x] replace `useRef` with `ref`
  - [x] replace `.current` with `.value`
### useState
  - [x] replace `useState` with `ref` or `reactive`
  - [x] transform `setState` call with raw expression
  - [ ] if was transformed to `ref`
    - [ ] replace every value access with `.value` member property access
  - [ ] transform initial state function provider to `ref` or `reactive` IIFE
  - [ ] unwrap callback's body from `setState` call
    - [x] rename argument to used in state declaration
    - [ ] rename argument in complex function body
### useCallback
  - [x] replace `useCallback` with wrapped callback in `computed`
  - [ ] replace `useCallback` with raw callback
### useMemo
  - [x] replace `useMemo` with `computed`
### useContext
  - [x] replace `useContext` with `inject`
### useLayoutEffect
  - [x] replace `useLayoutEffect` with `onBeforeMount`
  - [ ] if has cleanup callback
    - [ ] create additional `onUnmounted` lifecycle hook