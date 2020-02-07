import { transform } from "../../utils";

describe("useEffect", () => {
  describe("when has no dependencies", () => {
    it('should replace "useEffect" with "onUpdated"', () => {
      const result = transform(`useEffect(() => {});`);

      expect(result).toMatchInlineSnapshot(`"onUpdated(() => {});"`);
    });
  });

  describe("when has empty dependencies", () => {
    it('should replace "useEffect" with "onMounted"', () => {
      const result = transform(`useEffect(() => {}, []);`);

      expect(result).toMatchInlineSnapshot(`"onMounted(() => {});"`);
    });
  });

  describe("when has dependencies", () => {
    it('should replace "useEffect" with "watch"', () => {
      const result = transform(`useEffect(() => {}, [a]);`);

      expect(result).toMatchInlineSnapshot(`"watch([a], ([a]) => {});"`);
    });
  });

  describe("when returns cleanup callback", () => {
    describe("when has empty dependencies", () => {
      it('should create "onMounted" and "onUnmounted" lifecycle methods', () => {
        const result = transform(`
          useEffect(() => {
            return () => a;
          }, []);
        `);

        expect(result).toMatchInlineSnapshot(`
          "onMounted(() => {}), onUnmounted(
          () => a);"
        `);
      });
    });

    describe("when has no dependencies", () => {
      it.todo('should replace "useEffect" with "onUpdated" and "onUnmounted"');
    });

    describe("when has dependencies", () => {
      it('should replace "useEffect" with "watch"', () => {
        const result = transform(`
          useEffect(() => {
            return () => a;
          }, [a]);
        `);

        expect(result).toMatchInlineSnapshot(`
          "watch([

          a], ([a], prev, onCleanup) => {onCleanup(() => a);});"
        `);
      });
    });
  });
});
