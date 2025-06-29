import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/db';

// GET /api/messages - Get messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const conversationWith = searchParams.get('conversation_with')
    const unreadOnly = searchParams.get('unread_only') === 'true'
    
    let query = `
      SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.timestamp,
        m.is_read,
        m.read_status,
        s.name as sender_name,
        s.full_name as sender_full_name,
        r.name as receiver_name,
        r.full_name as receiver_full_name
      FROM public.messages m
      LEFT JOIN public.users s ON m.sender_id = s.id
      LEFT JOIN public.users r ON m.receiver_id = r.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 0
    
    if (userId && conversationWith) {
      paramCount++
      const param1 = paramCount
      paramCount++
      const param2 = paramCount
      query += ` AND ((m.sender_id = $${param1} AND m.receiver_id = $${param2}) 
                  OR (m.sender_id = $${param2} AND m.receiver_id = $${param1}))`
      params.push(userId, conversationWith)
    } else if (userId) {
      paramCount++
      query += ` AND (m.sender_id = $${paramCount} OR m.receiver_id = $${paramCount})`
      params.push(userId)
    }
    
    if (unreadOnly && userId) {
      paramCount++
      query += ` AND m.receiver_id = $${paramCount} AND m.is_read = false`
      if (params.length < paramCount) params.push(userId)
    }
    
    query += ' ORDER BY m.timestamp DESC'
    
    const result = await client.query(query, params)
    
    return NextResponse.json({
      messages: result.rows,
      total: result.rowCount
    })
    
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sender_id, receiver_id, content } = body
    
    if (!sender_id || !receiver_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const query = `
      INSERT INTO public.messages (
        sender_id,
        receiver_id,
        content,
        timestamp,
        is_read,
        read_status
      ) VALUES ($1, $2, $3, NOW(), false, 'unread')
      RETURNING *
    `
    
    const values = [sender_id, receiver_id, content]
    const result = await client.query(query, values)
    
    // Create notification for receiver
    const notificationQuery = `
      INSERT INTO public.notifications (
        user_id,
        message,
        type,
        is_read,
        created_at
      ) VALUES ($1, $2, 'message', false, NOW())
    `
    
    await client.query(notificationQuery, [
      receiver_id,
      `New message from user ${sender_id}`
    ])
    
    return NextResponse.json({
      message: result.rows[0],
      message_sent: 'Message sent successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// PUT /api/messages - Update message (mark as read)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, mark_as_read, receiver_id } = body
    
    if (!id && !receiver_id) {
      return NextResponse.json(
        { error: 'Message ID or receiver ID is required' },
        { status: 400 }
      )
    }
    
    let query: string
    let values: any[]
    
    if (mark_as_read && receiver_id && !id) {
      // Mark all messages as read for a receiver
      query = `
        UPDATE public.messages
        SET is_read = true, read_status = 'read'
        WHERE receiver_id = $1 AND is_read = false
        RETURNING id
      `
      values = [receiver_id]
    } else if (id) {
      // Mark specific message as read
      query = `
        UPDATE public.messages
        SET is_read = true, read_status = 'read'
        WHERE id = $1
        RETURNING *
      `
      values = [id]
    } else {
      return NextResponse.json(
        { error: 'Invalid update request' },
        { status: 400 }
      )
    }
    
    const result = await client.query(query, values)
    
    return NextResponse.json({
      updated_count: result.rowCount,
      message: 'Messages marked as read'
    })
    
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

// DELETE /api/messages - Delete message
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }
    
    const query = 'DELETE FROM public.messages WHERE id = $1 RETURNING id'
    const result = await client.query(query, [id])
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Message deleted successfully',
      deleted_id: result.rows[0].id
    })
    
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}