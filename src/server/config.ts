import path from "node:path"

const defaultDataDirectory = path.join(process.env.HOME ?? "/Users/kanehooper", "Library", "Application Support", "OperationsPortal")

export const config = {
  dataDirectory: process.env.OPERATIONS_DATA_DIR ?? defaultDataDirectory,
  databasePath: process.env.OPERATIONS_DATABASE_PATH ?? path.join(process.env.OPERATIONS_DATA_DIR ?? defaultDataDirectory, "operations.sqlite"),
  ownerEmail: process.env.OPERATIONS_OWNER_EMAIL?.trim().toLowerCase() ?? "",
  portalOrigin: process.env.BETTER_AUTH_URL ?? "http://127.0.0.1:3015",
  authSecret: process.env.BETTER_AUTH_SECRET ?? "development-only-change-this-before-deploying",
  pm2Home: process.env.PM2_HOME ?? path.join(process.env.HOME ?? "", ".pm2"),
  pm2Owner: process.env.OPERATIONS_PM2_OWNER ?? process.env.USER ?? "",
} as const

export const isProduction = process.env.NODE_ENV === "production"
