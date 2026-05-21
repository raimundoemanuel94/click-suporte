import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'click-suporte-secret'

// Credenciais admin (por enquanto hardcoded, depois vem do banco)
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@clicksuporte.com',
  password: process.env.ADMIN_PASSWORD || 'clicksuporte2026'
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Validar credenciais
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json({
        success: false,
        error: 'Credenciais inválidas'
      }, { status: 401 })
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
    
    return NextResponse.json({
      success: true,
      token,
      user: { email, role: 'admin' }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// Verificar token
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Token não fornecido'
      }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET)
    
    return NextResponse.json({
      success: true,
      user: decoded
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Token inválido ou expirado'
    }, { status: 401 })
  }
}
