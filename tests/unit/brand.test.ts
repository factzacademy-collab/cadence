import { describe, it, expect } from "vitest";
import { BRAND, PLATFORMS, PLATFORM_LIST, MARKETING_NAV, FOOTER_COLUMNS } from "@/lib/brand";

describe("BRAND", () => {
  it("has the expected name", () => {
    expect(BRAND.name).toBe("Cadence");
  });

  it("has a tagline", () => {
    expect(BRAND.tagline).toBeTruthy();
    expect(typeof BRAND.tagline).toBe("string");
  });

  it("has a domain", () => {
    expect(BRAND.domain).toBe("cadence.app");
  });
});

describe("PLATFORMS", () => {
  it("has 8 platforms", () => {
    expect(Object.keys(PLATFORMS).length).toBe(8);
  });

  it("includes all expected platforms", () => {
    const ids = Object.keys(PLATFORMS);
    expect(ids).toEqual(
      expect.arrayContaining([
        "x", "instagram", "linkedin", "facebook",
        "tiktok", "youtube", "threads", "pinterest",
      ])
    );
  });

  it("each platform has name and gradient", () => {
    for (const p of Object.values(PLATFORMS)) {
      expect(p.name).toBeTruthy();
      expect(p.gradient).toMatch(/^from-/);
    }
  });
});

describe("PLATFORM_LIST", () => {
  it("is an array with 8 entries", () => {
    expect(Array.isArray(PLATFORM_LIST)).toBe(true);
    expect(PLATFORM_LIST.length).toBe(8);
  });
});

describe("MARKETING_NAV", () => {
  it("has nav items with label and href", () => {
    expect(MARKETING_NAV.length).toBeGreaterThan(0);
    for (const item of MARKETING_NAV) {
      expect(item.label).toBeTruthy();
      expect(item.href).toMatch(/^#/);
    }
  });
});

describe("FOOTER_COLUMNS", () => {
  it("has 4 columns", () => {
    expect(FOOTER_COLUMNS.length).toBe(4);
  });

  it("each column has a title and links", () => {
    for (const col of FOOTER_COLUMNS) {
      expect(col.title).toBeTruthy();
      expect(col.links.length).toBeGreaterThan(0);
    }
  });
});
