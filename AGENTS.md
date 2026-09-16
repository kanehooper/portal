<!-- BEGIN:application-stack -->

## Application Stack

This Operations Portal was built from the reusable Next.js starter.

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
- `src/design-system/tokens.ts` — canonical visual values
- `src/design-system/theme.generated.css` — generated CSS variables and typography utilities
- `src/app/globals.css` — stylesheet import entry point
- `src/app/layout.tsx` — application root layout and global providers
- `AGENTS.md` — implementation rules and architectural constraints

Do not rely on training-data assumptions about Next.js APIs. Follow the repository's Next.js agent rules and inspect the installed Next.js documentation when required.

<!-- END:application-stack -->

<!-- BEGIN:operations-portal-stack -->

## Operations Portal Stack

This repository implements a single-owner operations portal. Keep these runtime boundaries intact.

- **Web:** Next.js 16.3.4 App Router and React 19.2.8. Route pages are Server Components by default; client components are limited to browser interaction and refresh behaviour.
- **Authentication:** Better Auth email/password with a single locally provisioned owner, database sessions, disabled public signup, host-only secure cookies and persistent rate limits. Use `src/server/auth.ts`; do not create another auth system or expose owner provisioning in the browser.
- **Persistence:** SQLite through `better-sqlite3`, Drizzle ORM and committed SQL migrations in `drizzle/`. Use `src/server/db/`; do not access SQLite directly from components, route handlers outside the server layer, or client code.
- **Validation:** Zod validates all browser-to-server input. Every protected route handler uses `requireApiOwner`; every mutation also verifies the trusted portal origin.
- **Worker:** `src/worker/main.ts` is an independent Node process. It owns PM2 observation, HTTP probes, command execution, recovery and connector operations. The Next.js process must only read stored data and enqueue allowlisted commands.
- **Process manager:** PM2 is an external monitored dependency. Access it only through `src/worker/pm2-adapter.ts`. Never issue broad commands such as `restart all`, `delete all`, `killDaemon`, or shell commands assembled from browser input.
- **Monitoring:** Scheduled samples run every 60 seconds. Health probes have a five-second deadline, no redirects, a 16 KiB body limit, TLS validation and validated destinations. Monitoring constants are operational configuration, not design tokens.
- **Status:** Use `deriveAppStatus()` and the shared seven statuses from `src/domain/operations.ts` and `src/design-system/status-styles.ts`. Do not derive badges independently in pages or components.
- **Commands:** Application controls are durable, target-specific commands in SQLite. They use idempotency keys, expiry, revalidation and worker-side verification. A queued command is not a successful operation.
- **Presentation:** `AppCard`, `HealthRow` and `StatusBadge` are shared production compositions. `/style-guide` may use fixtures only; demonstration handlers must never call operational APIs.
- **Deployment:** Production binds the web service to `127.0.0.1:3015`; Cloudflare maps only `portal.thehoopers.au` to that origin. Web and worker run as separate `launchd` services using the templates in `deploy/launchd/`, outside the PM2 instance they monitor.
- **Runtime state:** Production SQLite, backups and the environment file live under `/Users/kanehooper/Library/Application Support/OperationsPortal`, never in the repository, `public/`, or build output. Secrets remain in the external environment file and must not appear in logs, API responses or client bundles.

### Required workflow

1. Read the relevant installed Next.js documentation before changing App Router or Route Handler behaviour.
2. Run `pnpm theme:generate` after modifying `src/design-system/tokens.ts`; generated CSS is committed output.
3. Create schema changes through Drizzle and commit the generated migration. Apply migrations with `pnpm db:migrate`; never edit a production database manually.
4. Use `pnpm owner -- --email=<owner-email>` only from the local terminal to provision or reset the owner account. It revokes current sessions.
5. Verify `pnpm check:ui` before any build that regenerates theme output, then `pnpm build`. UI work also requires the visual review below. Report unavailable checks explicitly.
6. Treat production controls, Cloudflare ingress changes, real tunnel restarts, and Mac reboots as operational actions. Verify the exact target and preserve a rollback path before performing them.

<!-- END:operations-portal-stack -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:design-system-rules -->

## Design System

TypeScript tokens in `src/design-system/tokens.ts` own Operations Blue visual values. Run `pnpm theme:generate` after changing them; `src/design-system/theme.generated.css` is generated output and must not be edited manually. Application UI uses semantic tokens and complete `type-*` roles rather than literal colours or local font definitions.

Design-system CSS is organised by concern under `src/styles/`.

- `tokens.css` imports generated tokens and contains Tailwind semantic aliases.
- `typography.css` contains base typography rules; complete semantic roles are generated.
- `layout.css` contains shared structural layout styles.

Do not add unrelated design-system rules directly to `src/app/globals.css`. Treat `globals.css` primarily as the global stylesheet entry point.

1. Use only design-system font-family utilities: `font-sans`, `font-heading`, and `font-mono`. Do not reference specific font-family names or arbitrary font families inside application components.

2. [Critical] Use semantic colour utilities wherever a semantic token exists. Prefer utilities such as `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`, and `ring-ring`.

3. [Critical] Do not hard-code design colours inside application components using hex, RGB, HSL, OKLCH, inline styles, or arbitrary Tailwind values such as `bg-[#123456]`. Do not use palette colours such as `bg-blue-600` for standard application UI when a semantic token exists.

4. Treat `src/design-system/tokens.ts` as the source of truth for visual values. Do not redefine global colour, font-family, radius, or other design-system tokens inside individual components. Never hand-edit generated CSS.

5. Load application fonts through Next.js `next/font`. Components must consume fonts through design-system utilities rather than referencing Next.js font variables directly.

6. Reserve `src/components/ui/` for low-level reusable UI primitives, primarily shadcn components. Do not place feature-specific or domain-specific components in this directory.

7. Before creating a new low-level UI primitive, check whether an appropriate shadcn component already exists. Add shadcn components through the shadcn CLI and preserve the configuration defined in `components.json`.

8. Use the shadcn semantic token pairs correctly: a surface token such as `primary`, `card`, `secondary`, `muted`, or `accent` should normally use its matching `*-foreground` token for content displayed on that surface.

9. Dark mode is class-based using the `.dark` theme. Do not introduce separate `prefers-color-scheme` theme definitions or component-specific dark-mode colour systems unless explicitly required.

10. [Critical] Reuse existing design-system primitives and tokens before introducing new styling conventions. Do not create a second way to express a design decision that the design system already supports.

### Typography

11. Use the semantic typography styles for standard application text:
    - `type-page-title`
    - `type-panel-title`
    - `type-section-title`
    - `type-card-title`
    - `type-body`
    - `type-label`
    - `type-caption`
    - `type-data`
    - `type-metric`
    - `type-input`

12. Semantic typography styles define font family, size, line height, weight, and letter spacing. Do not recreate these styles inside application components using combinations such as `text-*`, `font-*`, `leading-*`, or `tracking-*`.

13. Use typography styles according to their semantic purpose. Do not choose a larger or smaller typography role merely to achieve a preferred visual size.

14. Do not use arbitrary font sizes, font weights, line heights, or letter-spacing values for standard application typography when an existing semantic typography style applies.

15. Low-level typography tokens may be used when implementing or maintaining design-system primitives, but application and feature components should prefer the semantic `type-*` styles.

16. Responsive typography should be defined centrally by the design system where possible rather than independently on individual pages.

### Typography role usage

17. Choose typography roles by semantic purpose, not by preferred visual size.

18. Do not invent typography class names. Add a genuinely missing role to the canonical tokens and regenerate utilities first.

19. Use `type-page-title` for the primary title of the current page. A page should normally have one primary page title.

20. Use `type-section-title` for significant named sections within a page.

21. Use `type-card-title` for titles of contained UI regions such as cards, panels, dialogs, drawers, widgets, and dashboard tiles.

22. Use `type-body` for normal readable prose and primary textual content.

23. Use `type-body` for supporting sentences; use `type-label` for form labels and `type-input` for input text.

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

## Spacing and rendered-layout acceptance

The previous spacing defect came from undefined CSS variables: the browser silently discarded padding and gap declarations even though lint/build passed. A token reference in code is not evidence that spacing renders correctly.

- Before implementation, name the owner of each space: PageContainer owns outer gutters; page stacks own section separation; grid parents own sibling gaps; cards/panels own internal padding; controls own their target size. Apply each once.
- Current contract: page gutters 16px below 768px, 24px from 768px, 32px from 1024px; section gap 24px; card padding 16px mobile/24px desktop; card group gap 16px; control targets 44px. Values come from canonical tokens, not local literals.
- Use parent `gap` for siblings. Do not patch missing tokens with scattered margins, spacer elements, arbitrary fallbacks or `!important`.
- New `var(--name)` references must have a generated/global definition. `pnpm css:check` checks authored CSS/TSX references and typography names; it runs with lint. Externally supplied variables must have a narrow documented provider entry in the checker, never a wildcard exemption.
- Static token coverage cannot prove cascade, import order, variable scope or computed layout. Run `pnpm test:layout` and inspect rendered output after UI/CSS changes.
- Test populated, empty and long-content states, all status labels, and missing values. Do not approve spacing from an empty dashboard alone. Reuse actual shared components in fixtures; never connect fixture interactions to production controls.
- Review 320, 390, 768, 1024, 1440 and 1920 CSS-pixel widths; verify gutters, header/content separation, card insets, text wrapping, control spacing and horizontal overflow. Check keyboard focus, reduced motion and 200% browser zoom/reflow.
- Save/review desktop and mobile screenshots. Update baselines only after inspecting the new image and explaining an intentional visual change. Never regenerate snapshots just to make a failure green.
- Completion notes must name tested widths/states, checks run, screenshot paths and limitations. A successful build alone is not visual acceptance.

See `docs/layout-quality.md` for commands, fixture isolation, baseline review and the reusable implementation prompt.
