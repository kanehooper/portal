import { expect, test } from "@playwright/test"
import { layoutSnapshot } from "../fixtures/applications"
import { statusPresentation } from "../../src/design-system/status-styles"

test.beforeEach(async ({ page }) => {
  // No credentials, production data or operational mutations in the layout suite.
  await page.route("**/api/**", (route) => route.request().url().endsWith("/api/dashboard") && route.request().method() === "GET"
    ? route.fulfill({ json: layoutSnapshot })
    : route.abort("blockedbyclient"))
})

for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`spacing contract at ${width}px`, async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()) })
    await page.setViewportSize({ width, height: 1000 })
    await page.goto("/layout-fixture")
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator(".application-card")).toHaveCount(7)
    const measurements = await page.evaluate(() => {
      const element = (selector: string) => document.querySelector<HTMLElement>(selector)!
      const style = (selector: string) => getComputedStyle(element(selector))
      const rect = (selector: string) => element(selector).getBoundingClientRect()
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        gutter: parseFloat(style(".page-container").paddingLeft),
        actualInset: rect(".page-header").left - rect(".portal-main").left,
        headerGap: rect(".page-content").top - rect(".page-header").bottom,
        toolbarGap: parseFloat(style(".applications-toolbar").gap),
        cardPadding: parseFloat(style(".application-card").paddingLeft),
        cardGap: parseFloat(style(".application-card").rowGap),
        cards: [...document.querySelectorAll<HTMLElement>(".application-card")].map((card) => {
          const identity = card.querySelector(".application-card-select")!.getBoundingClientRect()
          const actions = card.querySelector(".application-card-actions")!.getBoundingClientRect()
          return { overflow: card.scrollWidth > card.clientWidth, gap: actions.top - identity.bottom }
        }),
      }
    })
    const gutter = width >= 1024 ? 32 : width >= 768 ? 24 : 16
    expect(measurements.overflow).toBe(false)
    expect(measurements.gutter).toBe(gutter)
    expect(measurements.actualInset).toBe(gutter)
    expect(measurements.headerGap).toBe(24)
    expect(measurements.toolbarGap).toBe(12)
    expect(measurements.cardPadding).toBe(width >= 1024 ? 24 : 16)
    expect(measurements.cardGap).toBe(16)
    for (const card of measurements.cards) { expect(card.overflow).toBe(false); expect(card.gap).toBeGreaterThanOrEqual(16) }
    for (const { label } of Object.values(statusPresentation)) await expect(page.locator(".application-card .badge").filter({ hasText: label })).toHaveCount(1)
    await expect(page.getByText("Port unknown", { exact: true })).toBeVisible()
    if (width === 390 || width === 1440) await expect(page).toHaveScreenshot(`applications-${width}.png`, { fullPage: true })
    await page.screenshot({ path: test.info().outputPath(`review-${width}.png`), fullPage: true })
    await page.getByRole("button", { name: "View details", exact: true }).first().click()
    await expect(page.locator(".app-details")).toHaveCSS("gap", "16px")
    await expect(page.locator(".app-details section").first()).toHaveCSS("padding-top", "24px")
    await expect(page.locator(".details-close")).toHaveCSS("min-height", "44px")
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.getByRole("button", { name: "Close details" }).click()
    await page.getByPlaceholder("Search applications…").fill("no matches here")
    await expect(page.getByRole("heading", { name: "No matching applications" })).toBeVisible()
    await expect(page.locator(".empty-state")).toHaveCSS("gap", "8px")
    await expect(page.locator(".empty-state")).toHaveCSS("padding", "32px 24px")
    expect(errors).toEqual([])
  })
}

test("reflow at 200% equivalent viewport and keyboard focus", async ({ page }) => {
  // A 1280px desktop zoomed to 200% has a 640 CSS-pixel layout viewport.
  await page.setViewportSize({ width: 640, height: 500 })
  await page.goto("/layout-fixture")
  await page.keyboard.press("Tab")
  await expect(page.getByPlaceholder("Search applications…")).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
