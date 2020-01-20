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
});
