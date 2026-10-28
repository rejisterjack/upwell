import { describe, expect, it } from "vitest";
import { blockedTargetReason, isPrivateIp } from "./urls";

describe("blockedTargetReason", () => {
  it("allows a public https URL", () => {
    expect(blockedTargetReason("https://example.com/health")).toBeNull();
  });

  it("blocks private, link-local, and local hosts", () => {
    expect(blockedTargetReason("http://127.0.0.1")).toMatch(/private/i);
    expect(blockedTargetReason("http://169.254.169.254/latest")).toMatch(/private/i);
    expect(blockedTargetReason("http://localhost/admin")).toMatch(/public address/i);
    expect(blockedTargetReason("http://10.1.1.1")).toMatch(/private/i);
    expect(blockedTargetReason("file:///etc/passwd")).toMatch(/http/i);
    expect(isPrivateIp("::1")).toBe(true);
    expect(isPrivateIp("8.8.8.8")).toBe(false);
  });
});
