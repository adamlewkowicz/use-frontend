import { useReducer } from 'react';

interface ReactToVueState {
  reactCode: string
  vueCode: string
  options: {
    isPrettier: boolean
  }
}

const reactToVueInitialState: ReactToVueState = {
  reactCode: '',
  vueCode: '',
  options: {
    isPrettier: true,
  }
}

const reactToVueReducer = (
  state: ReactToVueState,
  action: ReactToVueAction
): ReactToVueState => {
  switch(action.type) {
    case 'UPDATE_REACT_CODE': return {
      ...state,
      reactCode: action.payload,
    }
    case 'UPDATE_OPTIONS': return {
      ...state,
      options: { ...state.options, ...action.payload }
    }
    default:
      return state;
  }
}

export const useReactToVue = () => {
  const [state, dispatch] = useReducer(reactToVueReducer, reactToVueInitialState);

  const togglePrettier = () => {
    const { isPrettier } = state.options;
    dispatch({ type: 'UPDATE_OPTIONS', payload: { isPrettier: !isPrettier }});
  }

  const updateReactCode = () => {
    
  }

  return {
    togglePrettier,
  }
}


type ReactToVueAction = 
  | { type: 'UPDATE_REACT_CODE', payload: string }
  | { type: 'UPDATE_OPTIONS', payload: Partial<ReactToVueState['options']> }