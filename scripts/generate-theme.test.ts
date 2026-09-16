import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { expect, it } from "vitest"
import { isThemeCurrent, renderTheme } from "./generate-theme"
import { tokens } from "../src/design-system/tokens"

it("generates deterministic spacing, literal breakpoints and all typography roles", () => {
  const output = renderTheme()
  expect(output).toBe(renderTheme())
  for (const value of Object.values(tokens.breakpoints).slice(0, 2)) expect(output).toContain(`min-width: ${value}`)
  for (const [key, value] of Object.entries(tokens.spacing)) expect(output).toContain(`--space-${key}: ${value}`)
  expect(output).toContain(`--page-padding: ${tokens.layout.pagePadding.mobile}`)
  expect(output).toContain(`--panel-padding: ${tokens.layout.panelPadding}`)
  for (const role of Object.keys(tokens.typography)) expect(output).toContain(`@utility type-${role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`)
})

it("detects missing/stale output without writing and accepts current output", async () => {
  const directory = await mkdtemp(join(tmpdir(), "theme-contract-"))
  const file = join(directory, "theme.css")
  try {
    expect(await isThemeCurrent(file)).toBe(false)
    await expect(readFile(file)).rejects.toThrow()
    await writeFile(file, "stale")
    expect(await isThemeCurrent(file)).toBe(false)
    expect(await readFile(file, "utf8")).toBe("stale")
    await writeFile(file, renderTheme())
    expect(await isThemeCurrent(file)).toBe(true)
  } finally { await rm(directory, { recursive: true }) }
})
