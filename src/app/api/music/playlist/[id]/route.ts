import { NextRequest, NextResponse } from 'next/server'
import { execute, query } from '@/lib/db'
import type { RowDataPacket } from 'mysql2/promise'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const numericId = parseInt(id, 10)

  if (isNaN(numericId)) {
    return NextResponse.json({ error: '无效的ID' }, { status: 400 })
  }

  try {
    const result = await execute('DELETE FROM `Playlist` WHERE id = ?', [numericId])

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: '歌曲不存在' }, { status: 404 })
    }

    // 重新整理排序
    const songs = await query<{ id: number } & RowDataPacket>(
      'SELECT id FROM `Playlist` ORDER BY sortOrder ASC, createdAt DESC',
    )
    for (let i = 0; i < songs.length; i++) {
      await execute('UPDATE `Playlist` SET sortOrder = ? WHERE id = ?', [i, songs[i].id])
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[music/playlist] 删除歌曲失败:', err)
    return NextResponse.json({ error: '删除歌曲失败' }, { status: 500 })
  }
}
