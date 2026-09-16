CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_user_idx` ON `account` (`userId`);--> statement-breakpoint
CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`appId` text,
	`connectorId` text,
	`type` text NOT NULL,
	`severity` text NOT NULL,
	`source` text NOT NULL,
	`summary` text NOT NULL,
	`outcome` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `activity_created_idx` ON `activity` (`createdAt`);--> statement-breakpoint
CREATE TABLE `appStatus` (
	`appId` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`diagnosis` text,
	`processState` text,
	`localResult` text,
	`publicResult` text,
	`localLatencyMs` integer,
	`publicLatencyMs` integer,
	`memoryBytes` integer,
	`uptimeSince` integer,
	`lastCheckedAt` integer,
	`localFailureCount` integer DEFAULT 0 NOT NULL,
	`publicFailureCount` integer DEFAULT 0 NOT NULL,
	`recoveryBlocked` text,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`appId`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`displayName` text NOT NULL,
	`icon` text DEFAULT 'Box' NOT NULL,
	`pm2Name` text NOT NULL,
	`pm2Namespace` text,
	`scriptPath` text,
	`workingDirectory` text,
	`processIdentity` text NOT NULL,
	`port` integer,
	`portSource` text,
	`publicOrigin` text,
	`healthPath` text DEFAULT '/api/health' NOT NULL,
	`healthMode` text DEFAULT 'identity' NOT NULL,
	`expectedAppKey` text,
	`connectorId` text,
	`intendedState` text DEFAULT 'running' NOT NULL,
	`autoRecovery` integer DEFAULT false NOT NULL,
	`recoveryPausedUntil` integer,
	`recipeJson` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_identity_idx` ON `applications` (`processIdentity`);--> statement-breakpoint
CREATE INDEX `applications_name_idx` ON `applications` (`displayName`);--> statement-breakpoint
CREATE TABLE `commands` (
	`id` text PRIMARY KEY NOT NULL,
	`targetType` text NOT NULL,
	`targetId` text NOT NULL,
	`action` text NOT NULL,
	`state` text DEFAULT 'queued' NOT NULL,
	`source` text NOT NULL,
	`idempotencyKey` text NOT NULL,
	`payloadJson` text,
	`result` text,
	`expiresAt` integer NOT NULL,
	`claimedAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commands_dedupe_idx` ON `commands` (`idempotencyKey`);--> statement-breakpoint
CREATE INDEX `commands_state_idx` ON `commands` (`state`,`expiresAt`);--> statement-breakpoint
CREATE TABLE `healthSamples` (
	`id` text PRIMARY KEY NOT NULL,
	`appId` text NOT NULL,
	`kind` text NOT NULL,
	`result` text NOT NULL,
	`statusCode` integer,
	`latencyMs` integer,
	`reason` text,
	`sampledAt` integer NOT NULL,
	FOREIGN KEY (`appId`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `health_samples_app_idx` ON `healthSamples` (`appId`,`sampledAt`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`activityId` text,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`readAt` integer,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rateLimit` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`count` integer NOT NULL,
	`lastRequest` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rate_limit_key_idx` ON `rateLimit` (`key`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `session` (`userId`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workerState` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updatedAt` integer NOT NULL
);
