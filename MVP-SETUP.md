# 🚀 CLICK SUPORTE MVP - SETUP GUIDE

## ✅ JÁ CONFIGURADO:

1. ✅ Supabase credenciais
2. ✅ Estrutura de pastas
3. ✅ package.json
4. ✅ .env.local
5. ✅ Schema SQL do banco

---

## 📋 PRÓXIMOS PASSOS:

### PASSO 1: Executar SQL no Supabase

1. Acesse: https://supabase.com/dashboard/project/yolwyujoatrimtibdicp
2. Menu lateral: **SQL Editor**
3. Clique: **New Query**
4. Cole o conteúdo do arquivo: `supabase-schema.sql`
5. Clique: **Run** (botão verde)
6. Aguarde: "Success. No rows returned"

Isso vai criar:
- ✅ Tabela `agendamentos`
- ✅ Tabela `configuracoes`
- ✅ Índices otimizados
- ✅ Triggers automáticos
- ✅ View do dashboard

---

### PASSO 2: Chave da API Anthropic (Claude)

Você precisa de uma API Key do Claude para a IA funcionar.

**Opção A - Você já tem conta:**
1. Acesse: https://console.anthropic.com/settings/keys
2. Crie nova API Key
3. Cole no arquivo `.env.local` na linha:
   `ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui`

**Opção B - Não tem conta ainda:**
Por enquanto posso criar um MOCK (IA fake) só pra testar
e depois você adiciona a API real.

---

### PASSO 3: Instalar dependências

```bash
cd /home/claude/click-suporte
npm install
```

---

## 🎯 PRÓXIMA FASE (após setup):

Vou criar:

**1. API de Agendamentos**
- POST /api/agendamentos (criar)
- GET /api/agendamentos (listar)
- PUT /api/agendamentos/[id] (atualizar status)

**2. API de IA**
- POST /api/chat (conversa com cliente)
- Diagnóstico inteligente
- Sugestão de horários

**3. Dashboard Admin**
- Login seguro
- Lista de pendentes
- Aprovar/Rejeitar
- Calendário semanal

**4. Widget IA no Site**
- Chat flutuante
- Coleta de dados
- Envio pro backend

---

## ⏱️ TEMPO ESTIMADO:

- Setup banco (você): 10 min
- API Key Claude (você): 5 min
- Desenvolvimento (eu): 2-3 dias

---

## ❓ ME CONFIRMA:

1. **Você executou o SQL no Supabase?** (sim/não)
2. **Você tem API Key do Claude?** (sim/não/depois)
3. **Quer que eu continue desenvolvendo?** (sim)

---

Aguardo confirmação para continuar! 🚀
