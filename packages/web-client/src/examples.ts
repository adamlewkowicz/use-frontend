
export const hookExamples = [
  {
    name: 'Basic example',
    code: `
      function useCounter() {
        const [counter, setCounter] = useState(0);
        const [abc, setAbc] = useState({ container: true });
      
        const doubledCounter = useMemo(() => counter * 2, [counter]);
        
        const increment = () => setCounter(c => c + 1);
        
        return { counter, doubledCounter, increment };
      }
      
      
      function useInputFocus() {
        const inputRef = useRef(null);
      
        useEffect(() => {
          if (inputRef.current != null) {
            inputRef.current.focus();
          }
        }, []);
      
        return inputRef;
      }
      
      
      function useTheme() {
        const theme = useContext(ThemeContext);
      
        if (theme == null) {
          throw new Error('Theme has not been provided');
        }
      
        return theme;
      }
    `
  },
  {
    name: 'useTodo',
    code: `
      const useTodos = () => {
        const [todos, setTodos] = useState([]);

        const addTodo = (todoName) => setTodos([...todos, todoName]);
  
        const removeTodo = (todoName) => {
          const filteredTodos = todos.filter(todo => todo.name !== todoName);
          setTodos(filteredTodos);
        }
  
        return {
          todos,
          addTodo,
          removeTodo
        }
      }
    `
  },
  {
    name: 'useMedia',
    code: `
    function useMedia(queries, values, defaultValue) {
      // Array containing a media query list for each query
      const mediaQueryLists = queries.map(q => window.matchMedia(q));
    
      // Function that gets value based on matching media query
      const getValue = () => {
        // Get index of first media query that matches
        const index = mediaQueryLists.findIndex(mql => mql.matches);
        // Return related value or defaultValue if none
        return typeof values[index] !== 'undefined' ? values[index] : defaultValue;
      };
    
      // State and setter for matched value
      const [value, setValue] = useState(getValue);
    
      useEffect(
        () => {
          // Event listener callback
          // Note: By defining getValue outside of useEffect we ensure that it has ...
          // ... current values of hook args (as this hook callback is created once on mount).
          const handler = () => setValue(getValue);
          // Set a listener for each media query with above handler as callback.
          mediaQueryLists.forEach(mql => mql.addListener(handler));
          // Remove listeners on cleanup
          return () => mediaQueryLists.forEach(mql => mql.removeListener(handler));
        },
        [] // Empty array ensures effect is only run on mount and unmount
      );
    
      return value;
    }
    `
  }
] as const;