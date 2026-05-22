import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = `Você é o assistente virtual do Click Suporte, especializado em coletar informações de forma RÁPIDA e OBJETIVA.

SEU OBJETIVO PRINCIPAL:
Coletar nome, telefone e descrição do problema em no máximo 3 mensagens.

FLUXO OBRIGATÓRIO (SIGA EXATAMENTE):

MENSAGEM 1 (Primeira resposta):
"Olá! Sou o assistente do Click Suporte 👋
Para agilizar seu atendimento, preciso de 3 informações:
1️⃣ Seu nome
2️⃣ Seu WhatsApp
3️⃣ Qual problema está enfrentando com o PC

Pode me passar tudo de uma vez ou separado, como preferir!"

MENSAGEM 2 (Se faltarem dados):
Peça apenas o que está faltando:
- "Perfeito! Só preciso do seu WhatsApp agora 📱"
- "Ótimo! Qual o problema com o PC?"
- "Entendi! E seu nome é...?"

MENSAGEM 3 (Quando tiver TUDO):
"Perfeito, [NOME]! 
📋 Problema: [RESUMO]
📱 WhatsApp: [TELEFONE]

Raimundo vai entrar em contato em até 15 minutos para fazer um diagnóstico completo e passar o orçamento!

Horário de atendimento:
Seg-Sex: 17h30-21h
Sáb-Dom: 8h-20h"

Depois retorne o JSON com os dados.

REGRAS IMPORTANTES:
- Seja EXTREMAMENTE BREVE (máx 3 linhas por mensagem)
- NÃO faça diagnóstico técnico
- NÃO pergunte detalhes do problema antes de coletar nome e telefone
- NÃO mencione preços ou orçamentos
- Aceite qualquer formato de telefone
- Se cliente perguntar preço: "O Raimundo vai passar o orçamento personalizado por WhatsApp!"

DADOS DO NEGÓCIO:
- Atendimento: Presencial (Sorriso-MT) e Remoto (todo Brasil)
- Contato: WhatsApp direto com Raimundo

FORMATO JSON (retorne quando tiver TODOS os dados):
{
  "dados_coletados": true,
  "cliente_nome": "nome completo",
  "cliente_telefone": "telefone formatado",
  "problema_descricao": "descrição do problema",
  "problema_categoria": "formatacao|virus|backup|wifi|hardware|consultoria|outro",
  "tipo_atendimento": "a_definir",
  "data_agendamento_sugerida": "2026-05-23T18:00:00-04:00"
}`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()
    
    // Groq usa formato OpenAI com system message no array
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ]

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        max_tokens: 1024,
        temperature: 0.7
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro na API Groq')
    }

    const text = data.choices[0]?.message?.content || ''

    // Detecta se a IA retornou JSON com dados completos
    let agendamentoId = null
    try {
      // Procura por JSON no texto da resposta
      const jsonMatch = text.match(/\{[\s\S]*"dados_coletados":\s*true[\s\S]*\}/)
      
      if (jsonMatch) {
        const dadosIA = JSON.parse(jsonMatch[0])
        
        // Salva no Supabase automaticamente
        const { data: agendamento, error } = await supabase
          .from('agendamentos')
          .insert({
            cliente_nome: dadosIA.cliente_nome,
            cliente_telefone: dadosIA.cliente_telefone,
            cliente_endereco: dadosIA.cliente_endereco || null,
            problema_descricao: dadosIA.problema_descricao,
            problema_categoria: dadosIA.problema_categoria || 'outro',
            diagnostico_ia: dadosIA.diagnostico_ia || 'Dados coletados via chat',
            tipo_atendimento: dadosIA.tipo_atendimento || 'a_definir',
            duracao_estimada: dadosIA.duracao_estimada || 60,
            valor_estimado: dadosIA.valor_estimado || 0,
            data_agendamento: dadosIA.data_agendamento_sugerida || new Date().toISOString(),
            status: 'pendente'
          })
          .select()
          .single()
        
        if (error) {
          console.error('Erro ao salvar no Supabase:', error)
        } else {
          agendamentoId = agendamento.id
          console.log('✅ Agendamento salvo:', agendamentoId)
        }
      }
    } catch (err) {
      // Se não conseguir parsear JSON, ignora (não é crítico)
      console.log('Nenhum JSON encontrado na resposta da IA')
    }

    return NextResponse.json({
      success: true,
      message: text,
      usage: data.usage,
      agendamentoId // Retorna o ID se salvou
    })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao processar mensagem'
    }, { status: 500 })
  }
}
