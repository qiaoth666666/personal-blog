-- ============================================================
-- 「拾曲」播放列表表（妖狐酷狗API v2）
-- ============================================================
CREATE TABLE IF NOT EXISTS `Playlist` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `n` INT NOT NULL COMMENT '歌曲序号（妖狐API搜索结果序号，从1开始）',
  `title` VARCHAR(255) NOT NULL COMMENT '歌曲名称',
  `artist` VARCHAR(255) NOT NULL COMMENT '歌手名称',
  `album` VARCHAR(255) DEFAULT NULL COMMENT '专辑名称',
  `coverUrl` VARCHAR(500) DEFAULT NULL COMMENT '封面图片URL',
  `searchMsg` VARCHAR(255) DEFAULT NULL COMMENT '搜索关键词（用于重新获取播放链接）',
  `duration` INT DEFAULT NULL COMMENT '歌曲时长（秒）',
  `sortOrder` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
  INDEX `idx_playlist_sort` (`sortOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
