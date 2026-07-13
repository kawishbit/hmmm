import { describe, expect, test } from "bun:test";
import { isSiteThemeId, themeById } from "./themes";

describe("isSiteThemeId", () => {
  test("accepts known themes", () => {
    expect(isSiteThemeId("light")).toBe(true);
    expect(isSiteThemeId("navy")).toBe(true);
  });

  test("rejects unknown or empty", () => {
    expect(isSiteThemeId("solarized")).toBe(false);
    expect(isSiteThemeId("")).toBe(false);
    expect(isSiteThemeId(null)).toBe(false);
    expect(isSiteThemeId(undefined)).toBe(false);
  });
});

describe("themeById", () => {
  test("returns matching theme", () => {
    expect(themeById("mint").label).toBe("Mint");
  });
});
