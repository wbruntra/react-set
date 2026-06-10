CREATE TABLE `users` (
  `uid` varchar(255),
  `email` varchar(255),
  `info` text,
  `created_at` datetime default CURRENT_TIMESTAMP,
  primary key (`uid`)
)