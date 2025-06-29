import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/db'

// GET /api/medical-records - Get medical records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const animalId = searchParams.get('animal_id')
    const vetId = searchParams.get('vet_id')
    const recordId = searchParams.get('id')
    
    let query = `
      SELECT 
        mr.id,
        mr.animal_id,
        mr.vet_id,
        mr.diagnosis,
        mr.treatment,
        mr.notes,
        mr.created_at,
        a.name as animal_name,
        a.type as animal_type,
        v.name as vet_name,
        v.full_name as vet_full_name
      FROM public.medical_records mr
      LEFT JOIN public.animals a ON mr.animal_id = a.id
      LEFT JOIN public.users v ON mr.vet_id = v.id
      WHERE 1=1
    `
    
    const params: any[] = []
    let paramCount = 0
    
    if (recordId) {
      paramCount++
      query += ` AND mr.id = $${paramCount}`
      params.push(recordId)
    }
    
    if (animalId) {
      paramCount++
      query += ` AND mr.animal_id = $${paramCount}`
      params.push(animalId)
    }
    
    if (vetId) {
      paramCount++
      query += ` AND mr.vet_id = $${paramCount}`
      params.push(vetId)
    }
    
    query += ' ORDER BY mr.created_at DESC'
    
    const result = await client.query(query, params)
    
    return NextResponse.json({
      medical_records: result.rows,
      total: result.rowCount
    })
    
  } catch (error) {
    console.error('Error fetching medical records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
      { status: 500 }
    )
  }
}

// POST /api/medical-records - Create new medical record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { animal_id, vet_id, diagnosis, treatment, notes } = body
    
    if (!animal_id || !vet_id || !diagnosis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const query = `
      INSERT INTO public.medical_records (
        animal_id,
        vet_id,
        diagnosis,
        treatment,
        notes,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `
    
    const values = [animal_id, vet_id, diagnosis, treatment || '', notes || '']
    const result = await client.query(query, values)
    
    return NextResponse.json({
      medical_record: result.rows[0],
      message: 'Medical record created successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating medical record:', error)
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    )
  }
}

// PUT /api/medical-records - Update medical record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, diagnosis, treatment, notes } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }
    
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1
    
    if (diagnosis !== undefined) {
      updates.push(`diagnosis = $${paramCount}`)
      values.push(diagnosis)
      paramCount++
    }
    
    if (treatment !== undefined) {
      updates.push(`treatment = $${paramCount}`)
      values.push(treatment)
      paramCount++
    }
    
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`)
      values.push(notes)
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
      UPDATE public.medical_records
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `
    
    const result = await client.query(query, values)
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Medical record not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      medical_record: result.rows[0],
      message: 'Medical record updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating medical record:', error)
    return NextResponse.json(
      { error: 'Failed to update medical record' },
      { status: 500 }
    )
  }
}

// DELETE /api/medical-records - Delete medical record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }
    
    const query = 'DELETE FROM public.medical_records WHERE id = $1 RETURNING id'
    const result = await client.query(query, [id])
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Medical record not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: 'Medical record deleted successfully',
      deleted_id: result.rows[0].id
    })
    
  } catch (error) {
    console.error('Error deleting medical record:', error)
    return NextResponse.json(
      { error: 'Failed to delete medical record' },
      { status: 500 }
    )
  }
}