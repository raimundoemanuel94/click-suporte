import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = `Você é o atendente do Click Suporte. Seja NATURAL, SIMPLES e HUMANO como WhatsApp.

SAUDAÇÃO (horário):
- 5h-12h: "Bom dia!"
- 12h-18h: "Boa tarde!"
- 18h-5h: "Boa noite!"

FLUXO (UM CAMPO POR VEZ):

1. Cumprimento + Nome:
"[SAUDAÇÃO] Bem-vindo ao Click Suporte! 👋
Qual seu nome?"

2. Telefone:
"Legal, [NOME]! Qual seu WhatsApp?"

3. Email:
"Perfeito! E seu email?"

4. Sistema:
"Beleza! Seu computador é Windows, Mac ou Linux?"

5. Problema (LIVRE):
"Pode me contar o que tá acontecendo com o PC?"

6. Prioridade:
"Entendi! É algo urgente ou pode esperar?"
(Se disser "urgente/agora/rápido" → Urgente)
(Se disser "quando puder/normal" → Normal)
(Se não mencionar → Normal)

7. Tipo:
"Você quer atendimento aqui em Sorriso ou prefere remoto?"

8. Confirmação:
"✅ Tudo certo, [NOME]!

Protocolo: #[NÚMERO]
Problema: [RESUMO]

Raimundo vai te chamar no WhatsApp em até 15 minutos!

Horários: Seg-Sex 17h30-21h | Sáb-Dom 8h-20h"

REGRAS:
- UMA pergunta por vez
- Máximo 2 linhas
- SEM formatação excessiva
- Aceite variações naturais
- Seja amigável mas objetivo

Quando tiver TUDO, retorne JSON (invisível pro usuário):
{
  "dados_coletados": true,
  "cliente_nome": "nome",
  "cliente_telefone": "telefone",
  "cliente_email": "email",
  "problema_descricao": "descrição",
  "sistema_operacional": "Windows|Mac|Linux",
  "prioridade": "Normal|Urgente",
  "tipo_atendimento": "Presencial|Remoto"
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
    let protocolo = null
    
    try {
      // Procura por JSON no texto da resposta
      const jsonMatch = text.match(/\{[\s\S]*"dados_coletados":\s*true[\s\S]*\}/)
      
      if (jsonMatch) {
        const dadosIA = JSON.parse(jsonMatch[0])
        
        // Gera protocolo único (timestamp + 4 dígitos aleatórios)
        protocolo = `CS${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`
        
        // Salva no Supabase automaticamente
        const { data: agendamento, error } = await supabase
          .from('agendamentos')
          .insert({
            protocolo: protocolo,
            cliente_nome: dadosIA.cliente_nome,
            cliente_telefone: dadosIA.cliente_telefone,
            cliente_email: dadosIA.cliente_email || null,
            cliente_endereco: null,
            problema_descricao: dadosIA.problema_descricao,
            problema_categoria: dadosIA.problema_categoria || 'outro',
            sistema_operacional: dadosIA.sistema_operacional || 'Não informado',
            prioridade: dadosIA.prioridade || 'Normal',
            diagnostico_ia: `Prioridade: ${dadosIA.prioridade || 'Normal'} | SO: ${dadosIA.sistema_operacional || 'N/A'}`,
            tipo_atendimento: dadosIA.tipo_atendimento || 'Remoto',
            duracao_estimada: 60,
            valor_estimado: 0,
            data_agendamento: dadosIA.data_agendamento_sugerida || new Date().toISOString(),
            status: 'pendente' // Sempre pendente, independente da prioridade
          })
          .select()
          .single()
        
        if (error) {
          console.error('Erro ao salvar no Supabase:', error)
        } else {
          agendamentoId = agendamento.id
          console.log('✅ Agendamento salvo:', agendamentoId, 'Protocolo:', protocolo)
        }
      }
    } catch (err) {
      // Se não conseguir parsear JSON, ignora (não é crítico)
      console.log('Nenhum JSON encontrado na resposta da IA')
    }

    return NextResponse.json({
      success: true,
      message: text.replace('[NÚMERO]', protocolo || 'GERANDO...'), // Injeta protocolo na mensagem
      usage: data.usage,
      agendamentoId,
      protocolo
    })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao processar mensagem'
    }, { status: 500 })
  }
}
