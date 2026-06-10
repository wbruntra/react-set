CREATE TABLE `game_actions` (
  `id` integer not null primary key autoincrement,
  `game_code` varchar(255) not null,
  `seq` integer not null,
  `type` varchar(255) not null,
  `data` json not null,
  `created_at` text not null default CURRENT_TIMESTAMP,
  foreign key(`game_code`) references `multiplayer_games`(`code`) on delete CASCADE
)