import { testVisitors } from "../../utils";
import { useEffectVisitors } from "./index";

describe("useEffect visitors", () => {
  const transform = testVisitors(...useEffectVisitors);

  describe('when "useEffect" has no dependencies', () => {
    it('should replace "useEffect" with "onUpdated"', () => {
      const result = transform(`useEffect(() => {});`);

      expect(result).toMatchInlineSnapshot(`"onUpdated(() => {});"`);
    });
  });

  describe('when "useEffect" has empty dependencies', () => {
    it('should replace "useEffect" with "onMounted"', () => {
      const result = transform(`useEffect(() => {}, []);`);

      expect(result).toMatchInlineSnapshot(`"onMounted(() => {});"`);
    });
  });

  describe('when "useEffect" has dependencies', () => {
    it('should replace "useEffect" with "watch"', () => {
      const result = transform(`useEffect(() => {}, [a]);`);

      expect(result).toMatchInlineSnapshot(`"watch([a], ([a]) => {});"`);
    });
  });

  describe('when "useEffect" returns cleanup callback', () => {
    describe('when "useEffect" has empty dependencies', () => {
      it('should create "onMounted" and "onUnmounted" lifecycle methods', () => {
        const result = transform(`
          useEffect(() => {
            return () => a;
          }, []);
        `);

        expect(result).toMatchInlineSnapshot(`
          "onMounted(() => {
            return () => a;
          }), onUnmounted(() => a);"
        `);
      });
    });

    describe('when "useEffect" has no dependencies', () => {
      it('should replace "useEffect" with "onUpdated" and "onUnmounted"', () => {
        const result = transform(`
          useEffect(() => {
            return () => a;
          });
        `);

        expect(result).toMatchInlineSnapshot(`
          "onUpdated(() => {
            return () => a;
          });"
        `);
      });
    });

    describe('when "useEffect" has dependencies', () => {
      it('should replace "useEffect" with "watch"', () => {
        const result = transform(`
          useEffect(() => {
            return () => a;
          }, [a]);
        `);

        expect(result).toMatchInlineSnapshot(`
          "watch([

          a], ([a], prev, onCleanup) => {return () => a;});"
        `);
      });
    });
  });
});
