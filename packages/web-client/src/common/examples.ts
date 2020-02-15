
export const hookExamples = [
  {
    name: 'useCounter',
    code: `
      const useCounter = () => {
        const [counter, setCounter] = useState(0);

        const increment = () => setCounter(v => v + 1);

        return { counter, increment };        
      }
    `
  },
  {
    name: 'useMousePosition',
    code: `
      const useMousePosition = () => {
        const [x, setX] = useState(0);
        const [y, setY] = useState(0);
      
        function update(event) {
          setX(event.pageX);
          setY(event.pageY);
        }
      
        useEffect(() => {
          window.addEventListener("mousemove", update);
      
          return () => {
            window.removeEventListener("mousemove", update);
          }
        }, []);
        
        return { x, y };
      }
    `
  },
  {
    name: 'useApiData',
    code: `
      const useApiData = () => {
        const [data, setData] = useState(null);
        const [error, setError] = useState(null);
        const [isLoading, setIsLoading] = useState(true);
        const abortController = useRef(new AbortController());
      
        useEffect(() => {
          const { signal } = abortController.current;
      
          fetch("example.com", { signal })
            .then(response => response.json())
            .then(json => setData(json))
            .catch(error => setError(error))
            .finally(() => setIsLoading(false));
      
          return () => {
            abortController.current.abort();
          }
        }, []);
        
        return {
          data,
          error,
          isLoading
        };
      };
    `
  },
  {
    name: 'useInputFocus',
    code: `
      function useInputFocus() {
        const inputRef = useRef(null);
      
        useEffect(() => {
          if (inputRef.current != null) {
            inputRef.current.focus();
          }
        }, []);
      
        return inputRef;
      }
    `
  },
  {
    name: 'useTheme',
    code: `
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

const [defaultExample] = hookExamples;
const { code: defaultCode } = defaultExample;

export { defaultCode, defaultExample };