import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/db' // Adjust the path to your db.ts file


// GET /api/users/vets - Get all veterinarians
export async function GET(request: NextRequest) {
  try {
      // Fetch all users with role 'vet'
      const query = `
        SELECT 
          id, 
          name, 
          full_name, 
          email, 
          phone, 
          profile_picture, 
          address, 
          role, 
          created_at, 
          last_login
        FROM public.users
        ORDER BY created_at DESC
      `
      
      const result = await client.query(query)
      
      if(result) {
        return NextResponse.json({
            vets: result.rows,
            total: result.rowCount
        })
      }
    // Default response for non-vet requests
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
    
  } catch (error) {
    console.error('Error fetching veterinarians:', error)
    return NextResponse.json(
      { error: 'Failed to fetch veterinarians' },
      { status: 500 }
    )
  }
}