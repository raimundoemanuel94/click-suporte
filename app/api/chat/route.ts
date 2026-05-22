import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = `Você é o assistente do Click Suporte. Sua função é coletar dados do cliente de forma RÁPIDA e ESTRUTURADA.

FLUXO OBRIGATÓRIO (NÃO PULE ETAPAS):

MENSAGEM 1 (Cumprimento + Explicação):
"Olá! Bem-vindo ao Click Suporte 👋

Vou abrir um protocolo de atendimento para você. Preciso de algumas informações rápidas:

📋 **Dados de contato:**
• Nome completo
• WhatsApp
• Email

💻 **Sobre o problema:**
• Descrição breve
• Sistema operacional (Windows/Mac/Linux)
• Prioridade (Normal/Urgente/Crítico)
• Tipo de atendimento (Presencial/Remoto)

Pode enviar tudo de uma vez ou responder aos poucos!"

MENSAGENS SEGUINTES (Coleta o que falta):
Peça APENAS os dados que ainda não tem:
- "Perfeito! Só preciso do seu email agora 📧"
- "Ótimo! Qual o WhatsApp para contato? 📱"
- "Entendi! É Windows, Mac ou Linux? 💻"
- "Certo! Essa solicitação é Normal, Urgente ou Crítica? ⚡"
- "Beleza! Prefere atendimento Presencial (Sorriso-MT) ou Remoto? 🌐"

MENSAGEM FINAL (Quando tiver TODOS os dados):
"✅ **Protocolo gerado com sucesso!**

**PROTOCOLO:** #[NÚMERO]
**Nome:** [NOME]
**Problema:** [RESUMO]
**Sistema:** [SO]
**Prioridade:** [PRIORIDADE]
**Atendimento:** [TIPO]

📱 Raimundo vai entrar em contato em até 15 minutos!

**Horários:** Seg-Sex 17h30-21h | Sáb-Dom 8h-20h

Obrigado por escolher o Click Suporte! 🚀"

Depois retorne APENAS o JSON (sem exibir para o usuário).

REGRAS IMPORTANTES:
- Seja BREVE (máx 3-4 linhas por mensagem)
- NÃO faça diagnóstico técnico
- NÃO mencione preços
- Aceite variações: "windows 10" = "Windows", "presencial" = "Presencial"
- Prioridade padrão se não informada: "Normal"
- Se perguntar preço: "O Raimundo passa o orçamento personalizado por WhatsApp!"

DADOS DO NEGÓCIO:
- Local: Sorriso-MT
- Atendimento: Presencial (Sorriso) e Remoto (Brasil todo)

FORMATO JSON (retorne quando tiver TODOS os dados):
{
  "dados_coletados": true,
  "protocolo": "gerado_automaticamente",
  "cliente_nome": "nome completo",
  "cliente_telefone": "telefone com DDD",
  "cliente_email": "email@exemplo.com",
  "problema_descricao": "descrição do problema",
  "problema_categoria": "formatacao|virus|backup|wifi|hardware|consultoria|licencas|outro",
  "sistema_operacional": "Windows|Mac|Linux|Outro",
  "prioridade": "Normal|Urgente|Critico",
  "tipo_atendimento": "Presencial|Remoto",
  "data_agendamento_sugerida": "ISO_DATE"
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
