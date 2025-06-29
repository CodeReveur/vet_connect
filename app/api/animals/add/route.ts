import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/db'

// Helper to get user from session
async function getUserFromSession(request: NextRequest) {
  const sessionToken = request.cookies.get('session-token')?.value
  
  if (!sessionToken) return null
  
  const result = await client.query(
    `SELECT user_id FROM sessions 
     WHERE token = $1 AND expires_at > NOW()`,
    [sessionToken]
  )
  
  return result.rows.length > 0 ? result.rows[0].user_id : null
}

// Add new animal (POST /api/animals)
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromSession(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const {
      name,
      type,
      breed,
      gender,
      birthDate,
      idNumber,
      color,
      weight,
      healthStatus,
      notes
    } = body

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    // Insert animal
    const result = await client.query(
      `INSERT INTO animals (
        owner_id, name, type, breed, gender, birth_date, 
        identification_number, color, weight, health_status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, type, health_status, created_at`,
      [
        userId,
        name,
        type,
        breed || null,
        gender || null,
        birthDate || null,
        idNumber || null,
        color || null,
        weight ? parseFloat(weight) : null,
        healthStatus || 'healthy',
        notes || null
      ]
    )

    return NextResponse.json(
      {
        message: 'Animal added successfully',
        animal: result.rows[0]
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Add animal error:', error)
    
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'An animal with this ID number already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to add animal' },
      { status: 500 }
    )
  }
}

// Get user's animals (GET /api/animals)
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromSession(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await client.query(
      `SELECT id, name, type, breed, gender, birth_date, 
              identification_number, color, weight, health_status, 
              notes, created_at, updated_at
       FROM animals 
       WHERE owner_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    )

    return NextResponse.json(
      { animals: result.rows },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get animals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch animals' },
      { status: 500 }
    )
  }
}

// Update animal (PUT /api/animals)
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserFromSession(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Animal ID is required' },
        { status: 400 }
      )
    }

    // Check if user owns this animal
    const ownerCheck = await client.query(
      'SELECT id FROM animals WHERE id = $1 AND owner_id = $2',
      [id, userId]
    )

    if (ownerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Animal not found' },
        { status: 404 }
      )
    }

    // Build update query dynamically
    const updateFields: string[] = []
    const values = []
    let paramCount = 1

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        // Convert camelCase to snake_case
        const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
        updateFields.push(`${dbField} = $${paramCount}`)
        values.push(value)
        paramCount++
      }
    })

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    values.push(id)

    const result = await client.query(
      `UPDATE animals 
       SET ${updateFields.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, name, type, health_status, updated_at`,
      values
    )

    return NextResponse.json(
      {
        message: 'Animal updated successfully',
        animal: result.rows[0]
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update animal error:', error)
    return NextResponse.json(
      { error: 'Failed to update animal' },
      { status: 500 }
    )
  }
}

// Delete animal (DELETE /api/animals?id=123)
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserFromSession(request)
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const animalId = searchParams.get('id')

    if (!animalId) {
      return NextResponse.json(
        { error: 'Animal ID is required' },
        { status: 400 }
      )
    }

    // Delete only if user owns the animal
    const result = await client.query(
      'DELETE FROM animals WHERE id = $1 AND owner_id = $2 RETURNING id',
      [animalId, userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Animal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Animal deleted successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete animal error:', error)
    return NextResponse.json(
      { error: 'Failed to delete animal' },
      { status: 500 }
    )
  }
}