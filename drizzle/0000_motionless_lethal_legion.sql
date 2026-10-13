CREATE TABLE `generation_usage` (
	`day` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`minute` integer NOT NULL,
	`minute_attempts` integer NOT NULL
);
