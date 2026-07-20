-- =====================================================
-- 下载日志表
-- 在 MySQL 中执行此脚本
-- =====================================================
CREATE TABLE IF NOT EXISTS `DownloadLog` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fileName` VARCHAR(255) NOT NULL,
  `fileSize` BIGINT DEFAULT 0 COMMENT '文件大小（字节）',
  `ip` VARCHAR(45) DEFAULT NULL,
  `userAgent` TEXT DEFAULT NULL,
  `downloadedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fileName (`fileName`),
  INDEX idx_downloadedAt (`downloadedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
