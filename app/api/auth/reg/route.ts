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

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate phone format (Rwandan phone number)
function isValidPhone(phone: string): boolean {
  if (!phone) return true; // Phone is optional
  return /^\+?250\s?[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const result = await client.query(
      `SELECT id, name, full_name, email, phone, address, role, created_at, last_login 
       FROM users 
       ORDER BY created_at DESC`
    );

    return NextResponse.json(
      {
        users: result.rows,
        vets: result.rows.filter((user: any) => user.role === 'vet') // Keep backward compatibility
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, email, phone, address, password, role } = body

    // Validate required fields
    if (!full_name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, and role are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone format
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use format: +250xxxxxxxxx' },
        { status: 400 }
      )
    }
    const roleReversed = role === 'farmer' ? 'owner' : 'vet';
    // Validate role
    if (!['admin', 'vet', 'owner'].includes(roleReversed)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be vet, or owner' },
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
    
    const hashedPassword = await hashPassword(password);

    const name = full_name.trim(' ');

    // Insert new user
    const result = await client.query(
      `INSERT INTO users (name, full_name, email, phone, address, password, role, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) 
       RETURNING id, name, full_name, email, phone, address, role, created_at`,
      [
        name.toLowerCase(),
        full_name || name,
        email,
        phone || null,
        address || null,
        hashedPassword,
        role
      ]
    )

    const newUser = result.rows[0]

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: newUser
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('User creation error:', error)
    
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

// PUT - Update existing user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, full_name, email, phone, address, role, password } = body

    // Validate required fields
    if (!id || !name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, email, and role are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone format
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use format: +250xxxxxxxxx' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['admin', 'vet', 'owner'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, vet, or owner' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    )

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email is taken by another user
    const emailCheck = await client.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, id]
    )

    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email is already taken by another user' },
        { status: 409 }
      )
    }

    // Prepare update query
    let updateQuery = `
      UPDATE users 
      SET name = $1, full_name = $2, email = $3, phone = $4, address = $5, role = $6
    `;
    const queryParams = [name, full_name || name, email, phone || null, address || null, role, id];

    // If password is provided, include it in the update
    if (password && password.trim() !== '') {
      const hashedPassword = await hashPassword(password);
      updateQuery += ', password = $7';
      queryParams.splice(-1, 0, hashedPassword); // Insert before the last parameter (id)
      updateQuery += ' WHERE id = $8';
    } else {
      updateQuery += ' WHERE id = $7';
    }

    updateQuery += ' RETURNING id, name, full_name, email, phone, address, role, created_at, last_login';

    // Execute update
    const result = await client.query(updateQuery, queryParams);

    const updatedUser = result.rows[0];

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: updatedUser
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('User update error:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json(
          { error: 'Email is already taken by another user' },
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

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user sessions first (if sessions table exists)
    try {
      await client.query('DELETE FROM sessions WHERE user_id = $1', [id]);
    } catch (error) {
      // Sessions table might not exist, continue with user deletion
      console.log('Sessions table not found or error deleting sessions:', error);
    }

    // Delete user
    await client.query('DELETE FROM users WHERE id = $1', [id]);

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}