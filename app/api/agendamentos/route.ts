import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { AgendamentoCreate } from '@/types'

// GET - Listar agendamentos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = supabase
      .from('agendamentos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ 
      success: true, 
      data 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// POST - Criar novo agendamento
export async function POST(request: NextRequest) {
  try {
    const body: AgendamentoCreate = await request.json()
    
    // Validações básicas
    if (!body.cliente_nome || !body.cliente_telefone || !body.problema_descricao) {
      return NextResponse.json({
        success: false,
        error: 'Dados obrigatórios faltando'
      }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('agendamentos')
      .insert([body])
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Agendamento criado com sucesso!'
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
