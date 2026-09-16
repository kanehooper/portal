import { describe, expect, it } from "vitest"
import { inspectCssContract } from "./check-css-contract"

const css = (text: string) => [{ path: "fixture.css", text }]
describe("CSS contract", () => {
  it("catches the original silently dropped page spacing", () => {
    expect(inspectCssContract(css(".page { padding: var(--page-padding-x); gap: var(--page-section-gap); }"))).toHaveLength(2)
  })
  it("accepts declared tokens and documented next/font variables", () => {
    expect(inspectCssContract(css(":root { --page-padding: 1rem; } .page { padding: var(--page-padding); font-family: var(--font-geist-sans); }"))).toEqual([])
  })
  it("does not let comments or fallback values hide typos", () => {
    expect(inspectCssContract(css("/* --typo: 1rem; */ .page { padding: var(--typo, 1rem); }"))).toHaveLength(1)
  })
  it("catches nonexistent typography utilities and inline variable references", () => {
    expect(inspectCssContract(css("@utility type-body { font-size: 1rem; }"), [{ path: "header.tsx", text: '<p className="type-body-sm" style={{ gap: "var(--missing)" }} />' }])).toHaveLength(2)
  })
})
