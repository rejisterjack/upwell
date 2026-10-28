import { test, expect } from "@playwright/test";

test("operator can publish status and an incident", async ({ page, request }) => {
  test.setTimeout(60_000);
  const unauthorized = await request.get("/api/cron/checks");
  expect(unauthorized.status()).toBe(401);

  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "No services yet" })).toBeVisible();
  await expect(page.getByLabel("90 day uptime")).toHaveCount(0);

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill("wrong-password-value");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("That password is not right.")).toBeVisible();

  await page.getByLabel("Password").fill(process.env.ADMIN_PASSWORD ?? "test-password-16ch");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Checks" })).toBeVisible();

  await page.goto("/admin/services");
  await page.getByLabel("Name").fill("Example");
  await page.getByLabel("URL").fill("http://127.0.0.1:3999/health");
  await page.getByRole("button", { name: "Add service" }).click();
  await expect(page.getByLabel("Name").nth(1)).toHaveValue("Example");

  await page.getByRole("button", { name: "Check now" }).click();
  await expect(page.getByText("Operational")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "All systems operational" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Example" })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 800 });
  const grid = page.getByLabel("90 day uptime");
  await expect(grid).toBeVisible();
  await expect(grid).toHaveCSS("overflow-x", "auto");

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/admin/incidents");
  await page.getByLabel("Title").fill("Elevated errors");
  await page.getByLabel("Update").fill("We are investigating.");
  await page.getByRole("button", { name: "Publish incident" }).click();
  await expect(page.getByRole("link", { name: "Elevated errors" })).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Elevated errors" })).toBeVisible();
  await page.getByRole("link", { name: "Elevated errors" }).click();
  await expect(page.getByText("We are investigating.")).toBeVisible();

  await page.goto("/admin/incidents");
  const incidentHref = await page.getByRole("link", { name: "Elevated errors" }).getAttribute("href");
  await page.goto(incidentHref ?? "/admin/incidents");
  await page.getByLabel("Update").fill("The incident is resolved.");
  await page.getByLabel("Status").selectOption("resolved");
  await page.getByRole("button", { name: "Post update" }).click();
  await expect(page.getByText("The incident is resolved.")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "All systems operational" })).toBeVisible();
});
