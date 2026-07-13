import { describe, expect, test } from "bun:test";
import { composeBackgroundFilter, MAX_BLUR_PX } from "./backgrounds";

describe("composeBackgroundFilter", () => {
  test("none + zero blur is none", () => {
    expect(composeBackgroundFilter("none", 0)).toBe("none");
  });

  test("preset only", () => {
    const css = composeBackgroundFilter("grayscale", 0);
    expect(css).toContain("grayscale");
    expect(css).not.toContain("blur");
  });

  test("blur only", () => {
    expect(composeBackgroundFilter("none", 8)).toBe("blur(8px)");
  });

  test("combines preset and blur", () => {
    const css = composeBackgroundFilter("sepia", 4);
    expect(css).toContain("sepia");
    expect(css).toContain("blur(4px)");
  });

  test("clamps blur to max", () => {
    expect(composeBackgroundFilter("none", 999)).toBe(`blur(${MAX_BLUR_PX}px)`);
  });

  test("negative blur treated as zero contribution", () => {
    expect(composeBackgroundFilter("none", -3)).toBe("none");
  });
});
