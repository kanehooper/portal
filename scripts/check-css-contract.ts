import { readFile, readdir } from "node:fs/promises"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

type Source = { path: string; text: string }
// These two variables are supplied by next/font in src/app/layout.tsx.
const externalVariables = new Set(["--font-geist-sans", "--font-geist-mono"])

export function inspectCssContract(css: Source[], components: Source[] = []) {
  const clean = css.map((source) => ({ ...source, text: source.text.replace(/\/\*[\s\S]*?\*\//g, "") }))
  const definitions = new Set(clean.flatMap(({ text }) => [...text.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1])))
  const roles = new Set(clean.flatMap(({ text }) => [...text.matchAll(/(?:@utility\s+|\.)(type-[\w-]+)/g)].map((match) => match[1])))
  const errors: string[] = []
  for (const { path, text } of [...clean, ...components]) {
    for (const match of text.matchAll(/var\(\s*(--[\w-]+)/g)) {
      if (!definitions.has(match[1]) && !externalVariables.has(match[1])) {
        errors.push(`${path}: undefined CSS variable ${match[1]}`)
      }
    }
  }
  for (const { path, text } of components) {
    for (const match of text.matchAll(/\btype-[a-z]+(?:-[a-z]+)*\b/g)) {
      if (!roles.has(match[0])) errors.push(`${path}: undefined typography utility ${match[0]}`)
    }
  }
  return [...new Set(errors)]
}

async function sources(directory: string): Promise<Source[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return sources(path)
    if (!/\.(css|tsx)$/.test(path)) return []
    return [{ path, text: await readFile(path, "utf8") }]
  }))
  return nested.flat()
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const files = await sources(resolve(import.meta.dirname, "../src"))
  const errors = inspectCssContract(files.filter(({ path }) => path.endsWith(".css")), files.filter(({ path }) => path.endsWith(".tsx")))
  if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1 }
  else console.log("CSS contract passed: variable references and typography roles are defined.")
}
