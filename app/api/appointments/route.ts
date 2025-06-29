import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/db'

// GET /api/appointments - Get all appointments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const vetId = searchParams.get('vet_id')
    const animalId = searchParams.get('animal_id')
    const status = searchParams.get('status')
    
    let query = `
      SELECT 
        a.id,
        a.user_id,
        a.vet_id,
        a.animal_id,
        a.appointment_date,
        a.created_at,
        a.status,
        a.payment_reference_id,
        a.payment_status,
        a.notes,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        v.name as vet_name,
        v.email as vet_email,
        v.phone as vet_phone,
        an.name as animal_name,
        an.health_status as animal_health_status,
        an.type as animal_type
      FROM public.appointments a
      LEFT JOIN public.users u ON a.user_id = u.id
      LEFT JOIN public.users v ON a.vet_id = v.id
      LEFT JOIN public.animals an ON a.animal_id = an.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 0
    
    if (userId) {
      paramCount++
      query += ` AND a.user_id = $${paramCount}`
      params.push(userId)
    }
    
    if (vetId) {
      paramCount++
      query += ` AND a.vet_id = $${paramCount}`
      params.push(vetId)
    }

    if (animalId) {
      paramCount++
      query += ` AND a.animal_id = $${paramCount}`
      params.push(animalId)
    }
    
    if (status) {
      paramCount++
      query += ` AND a.status = $${paramCount}`
      params.push(status)
    }
    
    
    query += ' ORDER BY a.appointment_date DESC'
    
    const result = await client.query(query, params)
    
    return NextResponse.json({
      appointments: result.rows,
      total: result.rowCount
    })
    
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, vet_id, animal_id, appointment_date, notes } = body

    // Validate required fields
    if (!user_id || !vet_id || !animal_id || !appointment_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert new appointment
    const query = `
      INSERT INTO public.appointments (
        user_id,
        vet_id,
        animal_id,
        appointment_date,
        created_at,
        status,
        payment_status,
        notes
      ) VALUES ($1, $2, $3, $4, $5, 'pending', 'pending', $6)
      RETURNING *
    `

    const created_at = new Date()
    const values = [user_id, vet_id, animal_id, appointment_date, created_at, notes]

    const result = await client.query(query, values)

    return NextResponse.json({
      appointment: result.rows[0],
      message: 'Appointment created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}

// PUT /api/appointments - Update appointment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, payment_status, payment_reference_id, notes } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }
    
    // Build dynamic update query
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1
    
    if (status) {
      updates.push(`status = $${paramCount}`)
      values.push(status)
      paramCount++
    }
    
    if (payment_status) {
      updates.push(`payment_status = $${paramCount}`)
      values.push(payment_status)
      paramCount++
    }

    if (notes) {
      updates.push(`notes = $${paramCount}`)
      values.push(notes)
      paramCount++
    }
    
    if (payment_reference_id) {
      updates.push(`payment_reference_id = $${paramCount}`)
      values.push(payment_reference_id)
      paramCount++
    }
    
    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }
    
    values.push(id)
    
    const query = `
      UPDATE public.appointments
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `
    
    const result = await client.query(query, values)
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      appointment: result.rows[0],
      message: 'Appointment updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}