import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "../auth-errors";

describe("getAuthErrorMessage", () => {
  it("maps invalid-credential and invalid-login-credentials", () => {
    expect(getAuthErrorMessage({ code: "auth/invalid-credential" })).toBe(
      "Email or password did not match."
    );
    expect(getAuthErrorMessage({ code: "auth/invalid-login-credentials" })).toBe(
      "Email or password did not match."
    );
  });

  it("falls back without leaking raw Firebase text", () => {
    expect(
      getAuthErrorMessage(
        { code: "auth/something-unknown", message: "Firebase: Error (auth/x)." },
        "Friendly fallback."
      )
    ).toBe("Friendly fallback.");
  });
});
