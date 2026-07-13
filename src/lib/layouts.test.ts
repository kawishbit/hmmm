import { describe, expect, test } from "bun:test";
import { exportDimensions, fitAspectRect } from "./layouts";

describe("exportDimensions", () => {
  test("square uses short side on both axes", () => {
    const d = exportDimensions("1:1");
    expect(d.width).toBe(1080);
    expect(d.height).toBe(1080);
  });

  test("portrait keeps width as short side", () => {
    const d = exportDimensions("9:16");
    expect(d.width).toBe(1080);
    expect(d.height).toBeGreaterThan(d.width);
    expect(d.width / d.height).toBeCloseTo(9 / 16, 2);
  });

  test("landscape keeps height as short side", () => {
    const d = exportDimensions("16:9");
    expect(d.height).toBe(1080);
    expect(d.width).toBeGreaterThan(d.height);
    expect(d.width / d.height).toBeCloseTo(16 / 9, 2);
  });
});

describe("fitAspectRect", () => {
  test("fits inside container without exceeding padding", () => {
    const r = fitAspectRect(800, 600, 1, 40, 720);
    expect(r.width).toBeLessThanOrEqual(800 - 80);
    expect(r.height).toBeLessThanOrEqual(600 - 80);
    expect(r.width / r.height).toBeCloseTo(1, 2);
  });

  test("respects maxSide cap", () => {
    const r = fitAspectRect(2000, 2000, 1, 0, 400);
    expect(Math.max(r.width, r.height)).toBeLessThanOrEqual(400);
  });

  test("portrait ratio constrained by height", () => {
    const r = fitAspectRect(400, 800, 9 / 16, 20, 2000);
    expect(r.width / r.height).toBeCloseTo(9 / 16, 2);
    expect(r.height).toBeLessThanOrEqual(800 - 40);
  });
});
