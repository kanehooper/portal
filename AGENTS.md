<!-- BEGIN:application-stack -->

## Application Stack

This repository is a reusable Next.js application starter.

Use the existing stack and conventions. Do not introduce alternative frameworks or overlapping libraries without explicit instruction.

- **Framework:** Next.js using the App Router
- **Language:** TypeScript
- **UI:** React
- **Styling:** Tailwind CSS v4
- **Component primitives:** shadcn/ui
- **Icons:** Lucide React
- **Package manager:** pnpm
- **Rendering model:** React Server Components by default; use Client Components only when client-side behaviour is required
- **Path aliases:** use `@/` imports as configured by the project

Treat these files as authoritative:

- `package.json` — installed packages and versions
- `components.json` — shadcn configuration and component aliases
- `src/app/globals.css` — design tokens, Tailwind theme mappings, and global styles
- `src/app/layout.tsx` — application root layout and global providers
- `AGENTS.md` — implementation rules and architectural constraints

Do not rely on training-data assumptions about Next.js APIs. Follow the repository's Next.js agent rules and inspect the installed Next.js documentation when required.

<!-- END:application-stack -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:design-system-rules -->

## Design System

Design-system CSS is organised by concern under `src/styles/`.

- `tokens.css` contains global design tokens and theme values.
- `typography.css` contains semantic typography styles.
- `layout.css` contains shared structural layout styles.

Do not add unrelated design-system rules directly to `src/app/globals.css`. Treat `globals.css` primarily as the global stylesheet entry point.

1. Use only design-system font-family utilities: `font-sans`, `font-heading`, and `font-mono`. Do not reference specific font-family names or arbitrary font families inside application components.

2. [Critical] Use semantic colour utilities wherever a semantic token exists. Prefer utilities such as `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`, and `ring-ring`.

3. [Critical] Do not hard-code design colours inside application components using hex, RGB, HSL, OKLCH, inline styles, or arbitrary Tailwind values such as `bg-[#123456]`. Do not use palette colours such as `bg-blue-600` for standard application UI when a semantic token exists.

4. Treat `src/app/globals.css` as the source of truth for global design tokens and theme mappings. Do not redefine global colour, font-family, radius, or other design-system tokens inside individual components.

5. Load application fonts through Next.js `next/font`. Components must consume fonts through design-system utilities rather than referencing Next.js font variables directly.

6. Reserve `src/components/ui/` for low-level reusable UI primitives, primarily shadcn components. Do not place feature-specific or domain-specific components in this directory.

7. Before creating a new low-level UI primitive, check whether an appropriate shadcn component already exists. Add shadcn components through the shadcn CLI and preserve the configuration defined in `components.json`.

8. Use the shadcn semantic token pairs correctly: a surface token such as `primary`, `card`, `secondary`, `muted`, or `accent` should normally use its matching `*-foreground` token for content displayed on that surface.

9. Dark mode is class-based using the `.dark` theme. Do not introduce separate `prefers-color-scheme` theme definitions or component-specific dark-mode colour systems unless explicitly required.

10. [Critical] Reuse existing design-system primitives and tokens before introducing new styling conventions. Do not create a second way to express a design decision that the design system already supports.

### Typography

11. Use the semantic typography styles for standard application text:
    - `type-display`
    - `type-page-title`
    - `type-section-title`
    - `type-card-title`
    - `type-body`
    - `type-body-sm`
    - `type-caption`

12. Semantic typography styles define font family, size, line height, weight, and letter spacing. Do not recreate these styles inside application components using combinations such as `text-*`, `font-*`, `leading-*`, or `tracking-*`.

13. Use typography styles according to their semantic purpose. Do not choose a larger or smaller typography role merely to achieve a preferred visual size.

14. Do not use arbitrary font sizes, font weights, line heights, or letter-spacing values for standard application typography when an existing semantic typography style applies.

15. Low-level typography tokens may be used when implementing or maintaining design-system primitives, but application and feature components should prefer the semantic `type-*` styles.

16. Responsive typography should be defined centrally by the design system where possible rather than independently on individual pages.

### Typography role usage

17. Choose typography roles by semantic purpose, not by preferred visual size.

18. Use `type-display` only for rare, exceptionally prominent text such as hero, onboarding, or major empty-state messaging. Do not use it for normal application page titles.

19. Use `type-page-title` for the primary title of the current page. A page should normally have one primary page title.

20. Use `type-section-title` for significant named sections within a page.

21. Use `type-card-title` for titles of contained UI regions such as cards, panels, dialogs, drawers, widgets, and dashboard tiles.

22. Use `type-body` for normal readable prose and primary textual content.

23. Use `type-body-sm` for supporting descriptions, helper content, and compact application text.

24. Use `type-caption` only for terse metadata and secondary information such as timestamps, counts, versions, or short status details. Do not use caption typography for normal sentences or form labels.

25. HTML heading elements (`h1`–`h6`) represent document structure and accessibility hierarchy. Typography classes represent visual roles. Choose each independently.

26. Design-system controls such as buttons, inputs, labels, tabs, badges, menus, table headers, and navigation items should own their typography. Do not add typography classes at call sites unless the component API explicitly requires it.

### Page layout

27. Standard application pages must use the shared `PageContainer` layout primitive, or a higher-level layout that already provides equivalent page containment.

28. Do not independently define page-level horizontal padding, vertical padding, maximum width, or centering in route pages or feature components.

29. Do not recreate page containment using combinations such as `mx-auto`, `max-w-*`, `px-*`, or `py-*` when `PageContainer` applies.

30. Do not nest `PageContainer` inside another layout that already provides page containment.

31. If a page genuinely requires different width or outer spacing behaviour, extend the design-system layout API rather than overriding `PageContainer` locally.

32. Standard pages should use the shared structure `PageContainer` → `PageHeader` → `PageContent` unless a higher-level layout explicitly provides an alternative.

33. Use `PageHeader` for the primary page title, optional page description, and page-level actions. Do not recreate page headers independently in route components.

34. Use `PageContent` to contain the major content regions of a standard page.

35. Parent layout components own spacing between their direct children. Prefer layout `gap` over margins on child components.

36. Do not use arbitrary `mt-*`, `mb-*`, or other external margins to control spacing between standard page regions.

37. Major direct children of `PageContent` represent page sections or major content regions. Their separation is controlled by the design system.

38. If the standard page spacing or header behaviour does not fit a genuine recurring use case, extend the layout component API rather than applying local spacing overrides.

<!-- END:design-system-rules -->
