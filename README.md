# Operations Portal

Run `pnpm db:migrate`, then provision the single owner with `pnpm owner -- --email=owner@example.com`. Set the production environment from the external `operations.env` file before deploying.

Production uses two launchd services under `deploy/launchd`: the web server on loopback port 3015 and the independent monitoring worker. The Cloudflare tunnel ingress for `portal.thehoopers.au` must point to `http://127.0.0.1:3015` only after the web service and login have been verified.

`pnpm backup` creates a consistent SQLite backup and keeps seven daily snapshots. To restore: stop both services, restore a compatible snapshot, revoke sessions, cancel queued commands, start the worker in monitor-only mode and verify current observations before re-enabling recovery.
