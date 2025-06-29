import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/db';

// GET /api/notifications - Get notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type')
    const unreadOnly = searchParams.get('unread_only') === 'true'
    
    let query = `
      SELECT 
        n.id,
        n.user_id,
        n.message,
        n.type,
        n.is_read,
        n.created_at,
        u.name as user_name,
        u.email as user_email
      FROM public.notifications n
      LEFT JOIN public.users u ON n.user_id = u.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 0
    
    if (userId) {
      paramCount++
      query += ` AND n.user_id = $${paramCount}`
      params.push(userId)
    }
    
    if (type) {
      paramCount++
      query += ` AND n.type = $${paramCount}`
      params.push(type)
    }
    
    if (unreadOnly) {
      query += ' AND n.is_read = false'
    }
    
    query += ' ORDER BY n.created_at DESC'
    
    const result = await client.query(query, params)
    
    return NextResponse.json({
      notifications: result.rows,
      total: result.rowCount,
      unread_count: result.rows.filter((n: any) => !n.is_read).length
    })
    
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, message, type = 'general' } = body
    
    if (!user_id || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const query = `
      INSERT INTO public.notifications (
        user_id,
        message,
        type,
        is_read,
        created_at
      ) VALUES ($1, $2, $3, false, NOW())
      RETURNING *
    `
    
    const values = [user_id, message, type]
    const result = await client.query(query, values)
    
    return NextResponse.json({
      notification: result.rows[0],
      message: 'Notification created successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications - Update notification (mark as read)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, user_id, mark_all_read } = body
    
    let query: string
    let values: any[]
    
    if (mark_all_read && user_id) {
      // Mark all notifications as read for a user
      query = `
        UPDATE public.notifications
        SET is_read = true
        WHERE user_id = $1 AND is_read = false
        RETURNING id
      `
      values = [user_id]
    } else if (id) {
      // Mark specific notification as read
      query = `
        UPDATE public.notifications
        SET is_read = true
        WHERE id = $1
        RETURNING *
      `
      values = [id]
    } else {
      return NextResponse.json(
        { error: 'Notification ID or user ID is required' },
        { status: 400 }
      )
    }
    
    const result = await client.query(query, values)
    
    if (result.rowCount === 0 && !mark_all_read) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      updated_count: result.rowCount,
      message: mark_all_read 
        ? `${result.rowCount} notifications marked as read`
        : 'Notification marked as read'
    })
    
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

// DELETE /api/notifications - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')
    const deleteAll = searchParams.get('delete_all') === 'true'
    
    let query: string
    let values: any[]
    
    if (deleteAll && userId) {
      // Delete all notifications for a user
      query = 'DELETE FROM public.notifications WHERE user_id = $1 RETURNING id'
      values = [userId]
    } else if (id) {
      // Delete specific notification
      query = 'DELETE FROM public.notifications WHERE id = $1 RETURNING id'
      values = [id]
    } else {
      return NextResponse.json(
        { error: 'Notification ID or user ID is required' },
        { status: 400 }
      )
    }
    
    const result = await client.query(query, values)
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Notification(s) not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: deleteAll 
        ? `${result.rowCount} notifications deleted`
        : 'Notification deleted successfully',
      deleted_count: result.rowCount
    })
    
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}