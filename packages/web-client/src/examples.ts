
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
  }
] as const;