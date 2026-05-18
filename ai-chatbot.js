/**
 * CHATBOT IA - CLICK SUPORTE
 * Substitui formulário por conversa inteligente
 * Usa Claude API (Anthropic)
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════
    // CONFIGURAÇÃO
    // ═══════════════════════════════════════════════════
    const CONFIG = {
        // API endpoint (proxy através do seu backend)
        apiUrl: 'https://api.anthropic.com/v1/messages',
        
        // Modelo Claude
        model: 'claude-sonnet-4-20250514',
        
        // Máximo de tokens
        maxTokens: 1000,
        
        // Coleta de dados obrigatórios
        requiredData: ['nome', 'telefone', 'problema']
    };

    // ═══════════════════════════════════════════════════
    // SISTEMA DE PROMPT
    // ═══════════════════════════════════════════════════
    const SYSTEM_PROMPT = `Você é um assistente virtual da Click Suporte, empresa de assistência técnica em Sorriso-MT.

SEU PAPEL:
- Conversar de forma amigável e natural
- Entender o problema técnico do cliente
- Coletar: nome, telefone e descrição do problema
- Não fazer orçamento (você não sabe preços)
- Encaminhar para atendimento humano via WhatsApp

ESTILO:
- Informal mas profissional
- Empático e prestativo
- Respostas curtas (máx 2-3 linhas)
- Use emojis com moderação
- Chame pelo nome quando souber

FLUXO:
1. Cumprimente e pergunte o problema
2. Faça 1-2 perguntas de esclarecimento
3. Peça nome (se não souber)
4. Peça telefone (formato: 97 99139-4382)
5. Confirme dados e finalize

EXEMPLO:
Usuário: "Meu PC tá lento"
Você: "Entendo 😕 Há quanto tempo começou? Liga normalmente?"

Usuário: "Faz 1 mês, demora 10min pra ligar"
Você: "Blz! Provavelmente precisa de limpeza ou formatação. Para te ajudar, qual seu nome?"

NUNCA:
- Dar preços ou orçamentos
- Prometer soluções sem avaliar
- Pedir dados pessoais além de nome/telefone
- Fazer diagnóstico técnico profundo

Quando tiver nome + telefone + problema: diga que vai encaminhar para atendimento.`;

    // ═══════════════════════════════════════════════════
    // ESTADO DA CONVERSA
    // ═══════════════════════════════════════════════════
    const ChatState = {
        // Estados possíveis
        STATES: {
            INITIAL: 'initial',
            COLLECTING_PROBLEM: 'collecting_problem',
            COLLECTING_NAME: 'collecting_name',
            COLLECTING_PHONE: 'collecting_phone',
            COMPLETE: 'complete'
        },
        
        currentState: 'initial',
        messages: [],
        userData: {
            nome: null,
            telefone: null,
            problema: null,
            urgencia: null
        },
        isComplete: false,
        
        addMessage(role, content) {
            this.messages.push({ role, content });
        },
        
        extractUserData(text) {
            // Extrai telefone com vários formatos
            const phonePatterns = [
                /(\d{2})\s*(\d{4,5})-?(\d{4})/,  // 97 99139-4382 ou 97 991394382
                /\(?(\d{2})\)?\s*(\d{4,5})-?(\d{4})/, // (97) 99139-4382
                /(\d{10,11})/ // 97991394382
            ];
            
            for (const pattern of phonePatterns) {
                const phoneMatch = text.match(pattern);
                if (phoneMatch && !this.userData.telefone) {
                    const ddd = phoneMatch[1];
                    const parte1 = phoneMatch[2];
                    const parte2 = phoneMatch[3] || phoneMatch[1].slice(-4);
                    this.userData.telefone = `${ddd} ${parte1}-${parte2}`;
                    break;
                }
            }
            
            // Extrai nome (2+ palavras começando com maiúscula)
            if (!this.userData.nome && this.currentState === this.STATES.COLLECTING_NAME) {
                // Remove números e caracteres especiais
                const cleanText = text.replace(/[0-9@#$%^&*()]/g, '').trim();
                const words = cleanText.split(/\s+/);
                
                // Verifica se tem pelo menos 2 palavras
                if (words.length >= 2) {
                    // Capitaliza cada palavra
                    const name = words
                        .filter(w => w.length > 1)
                        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                        .join(' ');
                    
                    if (name.length > 3) {
                        this.userData.nome = name;
                    }
                } else if (words.length === 1 && cleanText.length > 2) {
                    // Aceita um nome só se for maior que 2 caracteres
                    this.userData.nome = cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase();
                }
            }
            
            // Armazena problema (primeira mensagem real do usuário)
            if (!this.userData.problema && this.currentState === this.STATES.COLLECTING_PROBLEM) {
                this.userData.problema = text;
            }
        },
        
        isDataComplete() {
            return this.userData.nome && 
                   this.userData.telefone && 
                   this.userData.problema;
        },
        
        getNextState() {
            // Máquina de estados
            switch(this.currentState) {
                case this.STATES.INITIAL:
                    return this.STATES.COLLECTING_PROBLEM;
                    
                case this.STATES.COLLECTING_PROBLEM:
                    if (this.userData.problema) {
                        return this.STATES.COLLECTING_NAME;
                    }
                    return this.currentState;
                    
                case this.STATES.COLLECTING_NAME:
                    if (this.userData.nome) {
                        return this.STATES.COLLECTING_PHONE;
                    }
                    return this.currentState;
                    
                case this.STATES.COLLECTING_PHONE:
                    if (this.userData.telefone) {
                        return this.STATES.COMPLETE;
                    }
                    return this.currentState;
                    
                default:
                    return this.currentState;
            }
        },
        
        transitionState() {
            this.currentState = this.getNextState();
        },
        
        reset() {
            this.currentState = this.STATES.INITIAL;
            this.messages = [];
            this.userData = {
                nome: null,
                telefone: null,
                problema: null,
                urgencia: null
            };
            this.isComplete = false;
        }
    };

    // ═══════════════════════════════════════════════════
    // INTERFACE DO CHAT
    // ═══════════════════════════════════════════════════
    const ChatUI = {
        modal: null,
        chatContainer: null,
        input: null,
        sendBtn: null,
        
        init() {
            this.createModal();
            this.attachEvents();
        },
        
        createModal() {
            // Remove formulário antigo se existir
            const oldModal = document.getElementById('cs-modal-overlay');
            if (oldModal) {
                oldModal.remove();
            }
            
            // Cria modal do chat
            const modal = document.createElement('div');
            modal.id = 'cs-ai-modal';
            modal.className = 'cs-ai-modal';
            modal.innerHTML = `
                <div class="cs-ai-backdrop"></div>
                <div class="cs-ai-container">
                    <div class="cs-ai-header">
                        <div class="cs-ai-header-info">
                            <div class="cs-ai-avatar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                                    <circle cx="8" cy="10" r="1"/>
                                    <circle cx="16" cy="10" r="1"/>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                </svg>
                            </div>
                            <div>
                                <h3>Assistente Click Suporte</h3>
                                <span class="cs-ai-status">
                                    <span class="cs-ai-status-dot"></span>
                                    Online agora
                                </span>
                            </div>
                        </div>
                        <button class="cs-ai-close" id="cs-ai-close">✕</button>
                    </div>
                    
                    <div class="cs-ai-messages" id="cs-ai-messages">
                        <!-- Mensagens aparecem aqui -->
                    </div>
                    
                    <div class="cs-ai-input-container">
                        <input 
                            type="text" 
                            id="cs-ai-input" 
                            class="cs-ai-input"
                            placeholder="Digite sua mensagem..."
                            autocomplete="off"
                        >
                        <button id="cs-ai-send" class="cs-ai-send">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="cs-ai-footer">
                        🔒 Suas informações são protegidas pela LGPD
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            this.modal = modal;
            this.chatContainer = document.getElementById('cs-ai-messages');
            this.input = document.getElementById('cs-ai-input');
            this.sendBtn = document.getElementById('cs-ai-send');
        },
        
        attachEvents() {
            // Botão fechar
            document.getElementById('cs-ai-close').addEventListener('click', () => {
                this.close();
            });
            
            // Fechar ao clicar no backdrop
            this.modal.querySelector('.cs-ai-backdrop').addEventListener('click', () => {
                this.close();
            });
            
            // Enviar mensagem
            this.sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
            
            // Enter para enviar
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            
            // Abrir modal nos botões
            document.querySelectorAll('[id="cs-open-form"], .btn-primary, .btn-cta-final').forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.open();
                });
            });
        },
        
        open() {
            this.modal.classList.add('active');
            this.input.focus();
            
            // Mensagem inicial se não tiver nenhuma
            if (ChatState.messages.length === 0) {
                // Inicia no estado COLLECTING_PROBLEM
                ChatState.currentState = ChatState.STATES.COLLECTING_PROBLEM;
                
                setTimeout(() => {
                    const initialMsg = 'Olá! 👋 Sou o assistente da Click Suporte.\n\nComo posso te ajudar hoje?';
                    this.addBotMessage(initialMsg);
                    // Adiciona ao histórico para não repetir
                    ChatState.addMessage('assistant', initialMsg);
                }, 300);
            }
        },
        
        close() {
            this.modal.classList.remove('active');
        },
        
        addUserMessage(text) {
            const msg = document.createElement('div');
            msg.className = 'cs-ai-message cs-ai-message-user';
            msg.innerHTML = `
                <div class="cs-ai-message-content">${this.escapeHtml(text)}</div>
            `;
            this.chatContainer.appendChild(msg);
            this.scrollToBottom();
        },
        
        addBotMessage(text) {
            const msg = document.createElement('div');
            msg.className = 'cs-ai-message cs-ai-message-bot';
            msg.innerHTML = `
                <div class="cs-ai-message-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="8" cy="10" r="1" fill="currentColor"/>
                        <circle cx="16" cy="10" r="1" fill="currentColor"/>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    </svg>
                </div>
                <div class="cs-ai-message-content">${this.escapeHtml(text).replace(/\n/g, '<br>')}</div>
            `;
            this.chatContainer.appendChild(msg);
            this.scrollToBottom();
        },
        
        showTyping() {
            const typing = document.createElement('div');
            typing.className = 'cs-ai-typing';
            typing.id = 'cs-ai-typing';
            typing.innerHTML = `
                <div class="cs-ai-message-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                </div>
                <div class="cs-ai-typing-dots">
                    <span></span><span></span><span></span>
                </div>
            `;
            this.chatContainer.appendChild(typing);
            this.scrollToBottom();
        },
        
        hideTyping() {
            const typing = document.getElementById('cs-ai-typing');
            if (typing) typing.remove();
        },
        
        scrollToBottom() {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        },
        
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        async sendMessage() {
            const text = this.input.value.trim();
            if (!text) return;
            
            // Mostra mensagem do usuário
            this.addUserMessage(text);
            this.input.value = '';
            
            // Adiciona ao histórico
            ChatState.addMessage('user', text);
            
            // Extrai dados do texto
            ChatState.extractUserData(text);
            
            // Transiciona para próximo estado
            ChatState.transitionState();
            
            console.log('Novo estado:', ChatState.currentState);
            
            // Verifica se coleta está completa
            if (ChatState.isDataComplete() && !ChatState.isComplete) {
                this.finishConversation();
                return;
            }
            
            // Envia para IA
            this.showTyping();
            
            try {
                const response = await AIService.sendMessage(text);
                this.hideTyping();
                this.addBotMessage(response);
                
                // Adiciona resposta ao histórico
                ChatState.addMessage('assistant', response);
                
            } catch (error) {
                this.hideTyping();
                this.addBotMessage('Ops! Tive um problema. 😕\n\nVamos tentar de novo?');
                console.error('AI Error:', error);
            }
        },
        
        finishConversation() {
            ChatState.isComplete = true;
            
            const { nome, telefone, problema } = ChatState.userData;
            
            // Mensagem de conclusão
            this.addBotMessage(`Perfeito, ${nome}! 🎉\n\nVou encaminhar você para atendimento via WhatsApp agora.\n\nEm instantes você será atendido por nossa equipe!`);
            
            // Monta mensagem WhatsApp
            setTimeout(() => {
                const mensagem = `🎯 *ATENDIMENTO PRIORITÁRIO*\n\n` +
                    `📋 *Dados do Cliente:*\n` +
                    `👤 Nome: ${nome}\n` +
                    `📱 Telefone: ${telefone}\n\n` +
                    `🔧 *Problema:*\n${problema}\n\n` +
                    `_Atendido pelo Assistente IA_`;
                
                const mensagemEncoded = encodeURIComponent(mensagem);
                const whatsappURL = `https://wa.me/5597991394382?text=${mensagemEncoded}`;
                
                window.open(whatsappURL, '_blank');
                
                // Fecha modal após 2 segundos
                setTimeout(() => {
                    this.close();
                    ChatState.reset();
                }, 2000);
            }, 1500);
        }
    };

    // ═══════════════════════════════════════════════════
    // SERVIÇO DE IA (Claude API)
    // ═══════════════════════════════════════════════════
    const AIService = {
        async sendMessage(userMessage) {
            // MODO SIMULAÇÃO - Sem chamadas à API
            // Para usar API real, precisa de backend
            
            return this.simulateResponse(userMessage);
        },
        
        // callClaudeAPI comentada - causa erro CORS
        // Para usar API real, precisa criar backend PHP/Node
        /*
        async callClaudeAPI(userMessage) {
            try {
                const response = await fetch(CONFIG.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01',
                        'x-api-key': 'SUA_API_KEY_AQUI'
                    },
                    body: JSON.stringify({
                        model: CONFIG.model,
                        max_tokens: CONFIG.maxTokens,
                        system: SYSTEM_PROMPT,
                        messages: ChatState.messages
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }
                
                const data = await response.json();
                return data.content[0].text;
                
            } catch (error) {
                console.error('Claude API Error:', error);
                return this.fallbackResponse();
            }
        },
        */
        
        simulateResponse(userMessage) {
            // Simulação ROBUSTA baseada em máquina de estados
            return new Promise(resolve => {
                setTimeout(() => {
                    let response;
                    
                    console.log('Estado atual:', ChatState.currentState);
                    console.log('Dados coletados:', ChatState.userData);
                    
                    switch(ChatState.currentState) {
                        case ChatState.STATES.INITIAL:
                            // Primeira interação - sempre pede problema
                            response = 'Olá! 👋 Como posso te ajudar hoje?';
                            break;
                            
                        case ChatState.STATES.COLLECTING_PROBLEM:
                            // Usuário descreveu o problema, pede nome
                            response = 'Entendi o problema! 👍\n\nPara eu te ajudar melhor, qual seu nome completo?';
                            break;
                            
                        case ChatState.STATES.COLLECTING_NAME:
                            // Usuário deu o nome, pede telefone
                            if (ChatState.userData.nome) {
                                response = `Prazer, ${ChatState.userData.nome}! 😊\n\nQual seu WhatsApp para contato?\n\n💡 Exemplo: 97 99139-4382`;
                            } else {
                                // Nome não foi detectado, pede novamente
                                response = 'Não consegui identificar seu nome. 😅\n\nPode digitar seu nome completo? (Ex: João Silva)';
                            }
                            break;
                            
                        case ChatState.STATES.COLLECTING_PHONE:
                            // Usuário deu o telefone, finaliza
                            if (ChatState.userData.telefone) {
                                response = 'Perfeito! 🎉\n\nVou te encaminhar para atendimento agora mesmo!';
                            } else {
                                // Telefone não foi detectado, pede novamente
                                response = 'Não consegui identificar o telefone. 😅\n\nPode digitar no formato:\n97 99139-4382\n\nOu:\n(97) 99139-4382';
                            }
                            break;
                            
                        case ChatState.STATES.COMPLETE:
                            response = 'Redirecionando para WhatsApp...';
                            break;
                            
                        default:
                            response = 'Pode me dar mais informações?';
                    }
                    
                    resolve(response);
                }, 600);
            });
        },
        
        fallbackResponse() {
            return 'Desculpe, estou com dificuldade no momento. 😕\n\nQue tal me chamar direto no WhatsApp? É mais rápido!';
        }
    };

    // ═══════════════════════════════════════════════════
    // INICIALIZAÇÃO
    // ═══════════════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ChatUI.init());
    } else {
        ChatUI.init();
    }

    console.log('🤖 Chatbot IA inicializado');

})();
