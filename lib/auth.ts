import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'click-suporte-secret'

export function verifyAuth(request: NextRequest): { valid: boolean; error?: string } {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Token não fornecido' }
    }
    
    const token = authHeader.substring(7)
    jwt.verify(token, JWT_SECRET)
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Token inválido ou expirado' }
  }
}

export function requireAuth(request: NextRequest) {
  const auth = verifyAuth(request)
  
  if (!auth.valid) {
    return Response.json(
      { success: false, error: auth.error },
      { status: 401 }
    )
  }
  
  return null // Auth OK
}
