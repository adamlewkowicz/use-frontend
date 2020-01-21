import { mountPluginTester } from "../utils";
import { hooksToCompositionPlugin } from "../index";

const transform = mountPluginTester(hooksToCompositionPlugin);

describe("useState", () => {
  const transform = mountPluginTester(hooksToCompositionPlugin);

  describe("state declaration", () => {
    it("should destructure state declaration to single variable and change function name", () => {
      const result = transform(`
        const [counter, setCounter] = useState(0);
      `);

      expect(result).toEqual(`const counter = ref(0);`);
    });

    describe("when state has primitive type", () => {
      it('should transform "useState" to "ref" call', () => {
        const result = transform(`
          const [input, setInput] = useState('abc');
        `);

        expect(result).toEqual(`const input = ref('abc');`);
      });
    });

    describe("when state has reference type", () => {
      it('should transform "useState" to "reactive" call', () => {
        const result = transform(`
          const [items, setItems] = useState([]);
        `);

        expect(result).toEqual(`const items = reactive([]);`);
      });
    });
  });

  describe("state update", () => {
    describe('when "setState" received primitive expression (operation)', () => {
      describe("when state has primitive type", () => {
        it("should remove setState call and create assignment with .value property", () => {
          const result = transform(`
            const [input, setInput] = useState('abc');
            setInput('def');
          `);

          expect(result).toMatchInlineSnapshot(`
            "const input = ref('abc');
            input.value = 'def';"
          `);
        });
      });

      describe("when state has reference type", () => {
        it("should remove setState call and create assignment", () => {
          const result = transform(`
            const [list, setList] = useState([]);
            setList([...list, 5]);
          `);

          expect(result).toMatchInlineSnapshot(`
            "const list = reactive([]);
            list = [...list, 5];"
          `);
        });
      });
    });

    describe('when "setState" received callback', () => {
      it("should remove callback and extract it's body", () => {
        const result = transform(`
          const [counterX, setCounterX] = useState(0);
          setCounterX(c => c + 1);
        `);

        expect(result).toMatchInlineSnapshot(`
          "const counterX = ref(0);
          counterX.value = counterX + 1;"
        `);
      });
    });

    it("should handle all received values correctly", () => {
      const result = transform(`
        const [any, setAny] = useState(null);
        const anyVar = 8;

        setAny(anyVar);

        setAny('');
        setAny(1);
        setAny(false);
        setAny(null);
        setAny(undefined);

        setAny(1 + 1);
        setAny('a' + 'b');

        setAny({});
        setAny([...any, anyVar, 10]);

        setAny(c => c + 'a');
      `);

      expect(result).toMatchInlineSnapshot(`
        "const any = ref(null);
        const anyVar = 8;

        any.value = anyVar;

        any.value = '';
        any.value = 1;
        any.value = false;
        any.value = null;
        any.value = undefined;

        any.value = 1 + 1;
        any.value = 'a' + 'b';

        any.value = {};
        any.value = [...any, anyVar, 10];

        any.value = any + 'a';"
      `);
    });
  });
});

describe("useLayoutEffect", () => {
  describe('when "useLayoutEffect" has dependencies', () => {
    it('should replace "useLayoutEffect" with synchronous "watch"', () => {
      const result = transform(`
        useLayoutEffect(() => {

        }, [a]);
      `);

      expect(result).toMatchInlineSnapshot(`
        "watch(() => {

        }, [a]);"
      `);
    });
  });
});
