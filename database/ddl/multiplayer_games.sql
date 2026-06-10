CREATE TABLE `multiplayer_games` (
  `id` integer not null primary key autoincrement,
  `code` varchar(255) not null,
  `game_title` varchar(255) not null,
  `creator_uid` varchar(255),
  `initial_state` json not null,
  `started_at` text null,
  `finished_at` text null,
  `created_at` text not null default CURRENT_TIMESTAMP,
  `updated_at` text not null default CURRENT_TIMESTAMP
)