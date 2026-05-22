import { NextResponse } from 'next/server'

export async function GET() {
  const hasKey = !!process.env.GROQ_API_KEY
  const keyLength = process.env.GROQ_API_KEY?.length || 0
  const keyPrefix = process.env.GROQ_API_KEY?.substring(0, 10) || 'NOT_FOUND'
  
  // Testa a API do Groq
  let apiTest: any = { status: 'not_tested', error: null, success: false }
  
  if (hasKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            { role: 'system', content: 'Você é um assistente.' },
            { role: 'user', content: 'Oi' }
          ],
          max_tokens: 50
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        apiTest = {
          status: 'success',
          error: null,
          success: true,
          response: data.choices?.[0]?.message?.content || 'OK'
        }
      } else {
        apiTest = {
          status: 'api_error',
          error: data.error || data,
          success: false
        }
      }
    } catch (error: any) {
      apiTest = {
        status: 'network_error',
        error: error.message,
        success: false
      }
    }
  }
  
  return NextResponse.json({
    hasGroqKey: hasKey,
    keyLength,
    keyPrefix,
    apiTest
  })
}
