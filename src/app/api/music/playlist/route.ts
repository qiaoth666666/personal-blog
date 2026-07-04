import { NextRequest, NextResponse } from 'next/server'
import { query, execute } from '@/lib/db'
import type { MusicPlaylist } from '@/types/db'
import type { RowDataPacket } from 'mysql2/promise'

// GET - 获取播放列表
export async function GET() {
  try {
    const songs = await query<MusicPlaylist & RowDataPacket>(
      'SELECT * FROM `Playlist` ORDER BY sortOrder ASC, createdAt DESC',
    )
    return NextResponse.json({ songs })
  } catch (err) {
    console.error('[music/playlist] 获取播放列表失败:', err)
    return NextResponse.json({ error: '获取播放列表失败' }, { status: 500 })
  }
}

// POST - 添加歌曲到播放列表
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { n, msg, name, singer, album, coverUrl, duration } = body

    if (!n || !name || !singer) {
      return NextResponse.json(
        { error: '缺少必填字段: n, name, singer' },
        { status: 400 },
      )
    }

    // 获取当前最大 sortOrder
    const maxOrder = await query<RowDataPacket & { maxOrder: number }>(
      'SELECT COALESCE(MAX(sortOrder), -1) AS maxOrder FROM `Playlist`',
    )
    const nextOrder = (maxOrder[0]?.maxOrder ?? -1) + 1

    const result = await execute(
      `INSERT INTO \`Playlist\` (n, title, artist, album, coverUrl, searchMsg, duration, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [n, name, singer, album || null, coverUrl || null, msg || null, duration || null, nextOrder],
    )

    return NextResponse.json({ id: result.insertId, sortOrder: nextOrder }, { status: 201 })
  } catch (err) {
    console.error('[music/playlist] 添加歌曲失败:', err)
    return NextResponse.json({ error: '添加歌曲失败' }, { status: 500 })
  }
}

// PUT - 重新排序
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: '请提供排序ID数组 (ids)' }, { status: 400 })
    }

    for (let i = 0; i < ids.length; i++) {
      await execute('UPDATE `Playlist` SET sortOrder = ? WHERE id = ?', [i, ids[i]])
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[music/playlist] 排序失败:', err)
    return NextResponse.json({ error: '排序失败' }, { status: 500 })
  }
}
