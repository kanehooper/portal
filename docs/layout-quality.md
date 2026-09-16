# Layout quality and starter portability

## Why these checks exist

The portal's first layout consumed undefined page padding and section gap variables. CSS silently ignored those declarations, leaving the page flush with its container. Additional fixes restored card padding, toolbar spacing, wrapping and a non-overlapping action row. TypeScript and production builds cannot detect that class of error.

Use three layers: token coverage, computed browser geometry, and reviewed visual baselines. None replaces the others.

## Local workflow

1. After intentional token changes: `pnpm theme:generate`; inspect generated CSS.
2. Run `pnpm check:ui` (theme freshness **before** regeneration, CSS contract, lint, TypeScript, unit tests, browser layout tests).
3. Inspect screenshots and any differences in `playwright-report/` and `test-results/`. Baselines live beside `tests/layout/spacing.spec.ts`.
4. For an intentional visual change only, run `pnpm test:layout:update`, inspect both mobile and desktop images, then rerun `pnpm test:layout` without updating.
5. Run the production build separately and report browser-review limitations.

Install the matching browser with `pnpm exec playwright install chromium` on a new machine. Screenshot comparisons are platform/font-sensitive: generate and compare baselines on the same pinned OS and Playwright version. CI should run a fixed environment, commit its reviewed baselines, and upload the report on failure; do not blindly reuse macOS baselines on Linux.

The layout suite runs a separate development server on loopback port 4317 using `.next-layout`, never the live `.next` output. It does not reuse an existing server. `/layout-fixture` returns not-found unless development mode and `LAYOUT_TEST_MODE=1` are both set; it is unavailable in production. Fixtures use synthetic `.invalid` hosts and fixed timestamps. ApplicationsClient's preview mode disables polling, operational mutations and external app opening; browser tests additionally intercept all `/api/` calls. No login, PM2 access, real application registration or production mutation is needed. Run this suite only against its dedicated test server.

The fixture renders the actual PageContainer/Header/Content, PortalSidebar and ApplicationsClient/AppCard, so production component CSS changes are exercised. It includes all seven statuses, long identities and unknown port/address, and search produces the empty state. The suite checks six viewport widths, actual header insets, section gaps, card padding/gaps and overflow. The 640px test models the CSS viewport at 200% zoom on a 1280px display; it is **not** a substitute for manual browser zoom/accessibility review.

The static checker covers source CSS and TSX literal references. It checks names, not scope, circular references or computed validity. Generated theme freshness and geometry tests cover complementary failures. Do not use dynamic construction of typography or CSS variable names without extending coverage.

## What to carry into the original starter

- Keep one canonical token owner and a deterministic generator. Seed semantic spacing (inline, stack, group, section), responsive page gutters, card/panel insets and minimum control sizes. Ensure every exposed layout token is actually emitted.
- Copy the corrected **generic** design-system, page-layout and rendered-layout acceptance rules into the starter's `AGENTS.md`. Do not copy the Operations Portal backend/deployment section.
- Ship PageContainer/Header/Content with working defaults and a populated example page. Parent components own external gaps; surfaces own internal padding. Add generic Stack/Grid/Panel primitives when repeated layouts justify them, not a second overlapping spacing system.
- Port `scripts/check-css-contract.ts`, theme generation tests, and the `check:ui` workflow. Adapt the two external font providers to the starter. Require these checks in CI/branch protection.
- Replace the portal-specific fixture with generic production cards, forms, controls and tables. Include long content, empty/error states and missing metadata. Keep deterministic screenshots and geometry assertions; use approved design expectations rather than reading expected pixel values back from the same rendered CSS being tested.
- Add a pinned Playwright CI job: install dependencies/browser, run `check:ui`, upload diffs, then build. Establish reviewed screenshots in that CI environment. New projects customize branding/content while retaining layout acceptance tests.

This task changes this checkout only; it does not push updates to the upstream GitHub starter or configure branch protection.

## Reusable implementation prompt

> Implement using the existing design system. Before coding, identify spacing ownership for page gutters, section gaps, grids, card interiors and controls. Reuse shared layout primitives; verify every token/class exists. Validate real populated and empty states, long content and missing values in the browser at 320, 390, 768, 1024, 1440 and 1920px. Inspect computed padding/gaps and overflow, keyboard focus, reduced motion and 200% zoom. Run the UI checks; save and inspect mobile/desktop screenshots. Do not claim visual completion from a build alone. Explain intentional baseline updates and report any unperformed checks.

## Initial verification — 16 September 2026

- Theme freshness, CSS contract, ESLint, TypeScript and nine unit tests passed.
- Seven Chromium browser tests passed: the six target widths and 200%-equivalent reflow/keyboard focus. Populated cards, every status label, unknown port, empty search state and details spacing were exercised. No console/hydration errors in the final run.
- Reviewed screenshots at all six widths; committed-ready comparison baselines: `tests/layout/spacing.spec.ts-snapshots/applications-390-darwin.png` and `applications-1440-darwin.png`. All-width review images are generated under `test-results/`.
- Production webpack build passed using `.next-layout` and temporary data, without replacing the live build. An isolated production server returned HTTP 404 for the fixture even with the test flag set.
- One earlier development-server run produced a transient JSON parsing error; the subsequent full run passed without relaxing assertions or updating baselines.
- Reduced-motion emulation and CSS viewport reflow were checked. Manual browser 200% zoom, a full accessibility audit and other browser engines were not performed. No upstream push, CI/branch-protection configuration or production deployment was performed.
