import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

// PUT - Atualizar agendamento (status, notas, etc) - REQUER AUTH
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticação
  const authError = requireAuth(request)
  if (authError) return authError
  
  try {
    const body = await request.json()
    const { id } = params
    
    const { data, error } = await supabase
      .from('agendamentos')
      .update(body)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Agendamento atualizado com sucesso!'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// GET - Buscar agendamento específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 404 })
  }
}

// DELETE - Deletar agendamento - REQUER AUTH
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar autenticação
  const authError = requireAuth(request)
  if (authError) return authError
  
  try {
    const { id } = params
    
    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: 'Agendamento deletado com sucesso!'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
