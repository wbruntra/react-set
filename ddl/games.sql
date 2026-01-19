CREATE TABLE `games` (
  `id` integer not null primary key autoincrement,
  `total_time` integer,
  `player_won` integer,
  `difficulty_level` integer,
  `winning_score` integer,
  `player_uid` varchar(255),
  `created_at` datetime default CURRENT_TIMESTAMP,
  `data` json default '{}'
)