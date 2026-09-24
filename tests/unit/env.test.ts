import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("works with an empty environment (zero-config local dev)", () => {
    const e = parseEnv({});
    expect(e.STORAGE_DRIVER).toBe("local");
    expect(e.DATABASE_URL).toBeUndefined();
    expect(e.RESEND_API_KEY).toBeUndefined();
  });

  it("treats empty strings from .env files as unset", () => {
    const e = parseEnv({ DATABASE_URL: "", STORAGE_DRIVER: "", NEXT_PUBLIC_SITE_URL: "" });
    expect(e.DATABASE_URL).toBeUndefined();
    expect(e.STORAGE_DRIVER).toBe("local");
  });

  it("rejects an invalid storage driver", () => {
    expect(() => parseEnv({ STORAGE_DRIVER: "ftp" })).toThrow();
  });
});
