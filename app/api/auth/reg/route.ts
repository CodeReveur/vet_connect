import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/db' // Adjust the path to your db.ts file


// Helper function to hash the password using SHA-256
async function hashPassword(password: string): Promise<string> {
  const textEncoder = new TextEncoder();
  const encoded = textEncoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, phone, password, location, userType } = body

    // Validate required fields
    if (!fullName || !email || !password || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone format (Rwandan phone number)
    if (phone && !/^\+?250\s?[0-9]{9}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    const hashedPassword = await hashPassword(password)

    // Determine role based on userType
    const role = userType === 'vet' ? 'vet' : 'owner'

    // Insert new user
    const result = await client.query(
      `INSERT INTO users (name, full_name, email, phone, address, password, role, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) 
       RETURNING id, name, full_name, email, phone, address, role, created_at`,
      [
        fullName.split(' ')[0], // Use first name as 'name'
        fullName,
        email,
        phone || null,
        location || null,
        hashedPassword,
        role
      ]
    )

    const newUser = result.rows[0]

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('invalid input syntax')) {
        return NextResponse.json(
          { error: 'Invalid data format' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}