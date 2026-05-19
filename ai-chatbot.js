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
    // ESTADO DA CONVERSA - PREMIUM COM BOTÕES
    // ═══════════════════════════════════════════════════
    const ChatState = {
        step: 0, // 0=inicial, 1=escolhendo serviço, 2=detalhes, 3=nome, 4=telefone, 5=email, 6=horário, 7=completo
        messages: [],
        userData: {
            servico: null,
            tipoEquipamento: null,
            sistemaOperacional: null,
            urgencia: null,
            problema: null,
            nome: null,
            telefone: null,
            email: null,
            horarioPreferido: null
        },
        
        // Serviços disponíveis
        SERVICOS: {
            'formatacao': {
                icon: '🖥️',
                label: 'Formatação de PC',
                desc: 'Formatação completa com backup'
            },
            'instalacao': {
                icon: '⚙️',
                label: 'Instalação de Programas',
                desc: 'Drivers, Office, software'
            },
            'suporte': {
                icon: '🔧',
                label: 'Suporte Técnico',
                desc: 'Problemas gerais'
            },
            'licencas': {
                icon: '🔑',
                label: 'Licenças Windows/Office',
                desc: 'Compra e ativação'
            }
        },
        
        addMessage(role, content) {
            this.messages.push({ role, content });
        },
        
        extractPhone(text) {
            const patterns = [
                /(\d{2})\s*(\d{4,5})\s*-?\s*(\d{4})/,
                /\(?(\d{2})\)?\s*(\d{4,5})\s*-?\s*(\d{4})/,
            ];
            
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    return `${match[1]} ${match[2]}-${match[3]}`;
                }
            }
            
            const numbers = text.replace(/\D/g, '');
            if (numbers.length === 11) {
                return `${numbers.slice(0,2)} ${numbers.slice(2,7)}-${numbers.slice(7)}`;
            }
            if (numbers.length === 10) {
                return `${numbers.slice(0,2)} ${numbers.slice(2,6)}-${numbers.slice(6)}`;
            }
            
            return null;
        },
        
        extractEmail(text) {
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
            const match = text.match(emailRegex);
            return match ? match[0] : null;
        },
        
        extractName(text) {
            const clean = text.replace(/[0-9@#$%^&*()_+=\[\]{}|\\;:'"<>?,./]/g, '').trim();
            
            if (clean.length < 2) return null;
            
            const words = clean.split(/\s+/).filter(w => w.length > 0);
            if (words.length === 0) return null;
            
            if (words.length === 1 && words[0].length > 2) {
                return words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
            }
            
            if (words.length >= 2) {
                return words
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(' ');
            }
            
            return null;
        },
        
        processUserInput(text, isButtonClick = false) {
            console.log('🔷 Step atual:', this.step);
            console.log('📝 Texto:', text);
            console.log('🔘 É botão?', isButtonClick);
            
            // Step 1: Escolhendo serviço
            if (this.step === 1) {
                const servicoKey = text.toLowerCase().replace(/\s+/g, '');
                
                if (this.SERVICOS[servicoKey]) {
                    this.userData.servico = servicoKey;
                    this.step = 2;
                    
                    // Perguntas específicas por serviço
                    if (servicoKey === 'formatacao') {
                        return {
                            text: 'Perfeito! Formatação de PC. 🖥️\n\nPara te ajudar melhor:',
                            buttons: [
                                { text: '💻 Notebook', value: 'notebook' },
                                { text: '🖥️ Desktop', value: 'desktop' },
                                { text: '🍎 Mac', value: 'mac' }
                            ],
                            question: 'Qual tipo de equipamento?'
                        };
                    }
                    
                    if (servicoKey === 'suporte') {
                        this.step = 3; // Pula direto para nome
                        return {
                            text: 'Entendi! Vou te ajudar com suporte técnico. 🔧\n\nDescreva brevemente seu problema:',
                            buttons: null
                        };
                    }
                    
                    // Outros serviços vão direto pro nome
                    this.step = 3;
                    return {
                        text: `Ótimo! ${this.SERVICOS[servicoKey].label}.\n\nQual seu nome completo?`,
                        buttons: null
                    };
                }
                
                return {
                    text: 'Não entendi. Escolha uma das opções acima clicando no botão.',
                    buttons: null
                };
            }
            
            // Step 2: Detalhes do serviço
            if (this.step === 2) {
                this.userData.tipoEquipamento = text.toLowerCase();
                this.step = 3;
                return {
                    text: 'Perfeito! ✅\n\nAgora, qual seu nome completo?',
                    buttons: null
                };
            }
            
            // Step 3: Coletando nome
            if (this.step === 3) {
                // Se veio de suporte, salva como problema
                if (this.userData.servico === 'suporte' && !this.userData.problema) {
                    this.userData.problema = text;
                    return {
                        text: 'Entendi o problema! 👍\n\nQual seu nome completo?',
                        buttons: null
                    };
                }
                
                const nome = this.extractName(text);
                if (nome) {
                    this.userData.nome = nome;
                    this.step = 4;
                    return {
                        text: `Prazer, ${nome}! 😊\n\nQual seu WhatsApp?\n\n💡 Ex: 97 99139-4382`,
                        buttons: null
                    };
                } else {
                    return {
                        text: 'Não consegui identificar seu nome. 😅\n\nPode digitar completo?\n(Ex: João Silva)',
                        buttons: null
                    };
                }
            }
            
            // Step 4: Coletando telefone
            if (this.step === 4) {
                const telefone = this.extractPhone(text);
                if (telefone) {
                    this.userData.telefone = telefone;
                    this.step = 5;
                    return {
                        text: 'Ótimo! 📱\n\nQual seu email? (Opcional - pode pular)',
                        buttons: [
                            { text: 'Pular ⏭️', value: 'pular_email' }
                        ]
                    };
                } else {
                    return {
                        text: 'Não consegui o telefone. 😅\n\nFormato:\n97 99139-4382\n\nOu:\n(97) 99139-4382',
                        buttons: null
                    };
                }
            }
            
            // Step 5: Coletando email (opcional)
            if (this.step === 5) {
                if (text.toLowerCase() === 'pular_email' || text.toLowerCase().includes('pular')) {
                    this.step = 6;
                    return {
                        text: 'Tudo bem! 👍\n\nQuando prefere ser atendido?',
                        buttons: [
                            { text: '🔥 Agora/Hoje', value: 'hoje' },
                            { text: '📅 Esta semana', value: 'semana' },
                            { text: '⏰ Sem pressa', value: 'flexivel' }
                        ]
                    };
                }
                
                const email = this.extractEmail(text);
                if (email) {
                    this.userData.email = email;
                    this.step = 6;
                    return {
                        text: 'Perfeito! ✉️\n\nQuando prefere ser atendido?',
                        buttons: [
                            { text: '🔥 Agora/Hoje', value: 'hoje' },
                            { text: '📅 Esta semana', value: 'semana' },
                            { text: '⏰ Sem pressa', value: 'flexivel' }
                        ]
                    };
                } else {
                    return {
                        text: 'Email inválido. 😅\n\nTente novamente ou clique "Pular"',
                        buttons: [
                            { text: 'Pular ⏭️', value: 'pular_email' }
                        ]
                    };
                }
            }
            
            // Step 6: Horário preferido
            if (this.step === 6) {
                this.userData.horarioPreferido = text.toLowerCase();
                this.step = 7;
                return 'complete';
            }
            
            return {
                text: 'Pode me dar mais informações?',
                buttons: null
            };
        },
        
        isComplete() {
            return this.step === 7;
        },
        
        reset() {
            this.step = 0;
            this.messages = [];
            this.userData = {
                servico: null,
                tipoEquipamento: null,
                sistemaOperacional: null,
                urgencia: null,
                problema: null,
                nome: null,
                telefone: null,
                email: null,
                horarioPreferido: null
            };
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
                                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="12" y="14" width="24" height="20" rx="4" fill="url(#robot-gradient-header)" stroke="currentColor" stroke-width="2.5"/>
                                    <line x1="24" y1="14" x2="24" y2="8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                                    <circle cx="24" cy="8" r="2.5" fill="#00d4ff">
                                        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="18" cy="22" r="3" fill="#00d4ff">
                                        <animate attributeName="r" values="3;3.5;3" dur="3s" repeatCount="indefinite"/>
                                    </circle>
                                    <circle cx="30" cy="22" r="3" fill="#00d4ff">
                                        <animate attributeName="r" values="3;3.5;3" dur="3s" repeatCount="indefinite"/>
                                    </circle>
                                    <path d="M 18 28 Q 24 31 30 28" stroke="#00d4ff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                                    <defs>
                                        <linearGradient id="robot-gradient-header" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style="stop-color:rgba(0, 212, 255, 0.3);stop-opacity:1" />
                                            <stop offset="100%" style="stop-color:rgba(14, 165, 233, 0.2);stop-opacity:1" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <div>
                                <h3>Assistente IA Click Suporte</h3>
                                <span class="cs-ai-status">
                                    <span class="cs-ai-status-dot"></span>
                                    Online agora
                                </span>
                            </div>
                        </div>
                        <button class="cs-ai-close" id="cs-ai-close">✕</button>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div class="cs-ai-progress-container" id="cs-ai-progress-container">
                        <div class="cs-ai-progress-info">
                            <span class="cs-ai-progress-label" id="cs-ai-progress-label">Iniciando...</span>
                            <span class="cs-ai-progress-step" id="cs-ai-progress-step">Etapa 1 de 7</span>
                        </div>
                        <div class="cs-ai-progress-bar">
                            <div class="cs-ai-progress-fill" id="cs-ai-progress-fill"></div>
                        </div>
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
                ChatState.step = 1; // Inicia escolhendo serviço
                
                setTimeout(() => {
                    const initialMsg = 'Olá! 👋 Sou o assistente IA da Click Suporte.\n\nEscolha o serviço que você precisa:';
                    
                    // Cards visuais em vez de botões simples
                    const servicesHTML = `
                        <div class="cs-ai-service-cards">
                            <div class="cs-ai-service-card" data-service="formatacao">
                                <div class="cs-ai-card-icon">🖥️</div>
                                <div class="cs-ai-card-content">
                                    <h4>Formatação de PC</h4>
                                    <p>Reinstalação completa do sistema</p>
                                    <span class="cs-ai-card-price">A partir de R$ 100</span>
                                </div>
                            </div>
                            <div class="cs-ai-service-card" data-service="instalacao">
                                <div class="cs-ai-card-icon">⚙️</div>
                                <div class="cs-ai-card-content">
                                    <h4>Instalação</h4>
                                    <p>Programas, drivers e configurações</p>
                                    <span class="cs-ai-card-price">A partir de R$ 80</span>
                                </div>
                            </div>
                            <div class="cs-ai-service-card" data-service="suporte">
                                <div class="cs-ai-card-icon">🔧</div>
                                <div class="cs-ai-card-content">
                                    <h4>Suporte Técnico</h4>
                                    <p>Resolução de problemas gerais</p>
                                    <span class="cs-ai-card-price">A partir de R$ 70</span>
                                </div>
                            </div>
                            <div class="cs-ai-service-card" data-service="licencas">
                                <div class="cs-ai-card-icon">🔑</div>
                                <div class="cs-ai-card-content">
                                    <h4>Licenças</h4>
                                    <p>Windows, Office e ativação</p>
                                    <span class="cs-ai-card-price">Consulte valores</span>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // Adiciona mensagem
                    const msg = document.createElement('div');
                    msg.className = 'cs-ai-message cs-ai-message-bot';
                    msg.innerHTML = `
                        <div class="cs-ai-message-avatar">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="12" y="14" width="24" height="20" rx="4" fill="url(#robot-gradient-init)" stroke="currentColor" stroke-width="2"/>
                                <line x1="24" y1="14" x2="24" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                <circle cx="24" cy="8" r="2" fill="#00d4ff">
                                    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="18" cy="22" r="2.5" fill="#00d4ff">
                                    <animate attributeName="r" values="2.5;3;2.5" dur="3s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="30" cy="22" r="2.5" fill="#00d4ff">
                                    <animate attributeName="r" values="2.5;3;2.5" dur="3s" repeatCount="indefinite"/>
                                </circle>
                                <path d="M 18 28 Q 24 31 30 28" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" fill="none"/>
                                <defs>
                                    <linearGradient id="robot-gradient-init" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:rgba(0, 212, 255, 0.2);stop-opacity:1" />
                                        <stop offset="100%" style="stop-color:rgba(14, 165, 233, 0.1);stop-opacity:1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div class="cs-ai-message-wrapper">
                            <div class="cs-ai-message-content">${this.escapeHtml(initialMsg).replace(/\n/g, '<br>')}</div>
                            ${servicesHTML}
                        </div>
                    `;
                    
                    this.chatContainer.appendChild(msg);
                    
                    // Adiciona eventos aos cards
                    msg.querySelectorAll('.cs-ai-service-card').forEach(card => {
                        card.addEventListener('click', () => {
                            const service = card.getAttribute('data-service');
                            const serviceLabel = card.querySelector('h4').textContent;
                            this.handleServiceCardClick(service, serviceLabel);
                        });
                    });
                    
                    this.scrollToBottom();
                    ChatState.addMessage('assistant', initialMsg);
                }, 300);
            }
        },
        
        handleServiceCardClick(service, label) {
            // Mostra como mensagem do usuário
            this.addUserMessage(label);
            
            // Desabilita todos os cards
            const cards = this.chatContainer.querySelectorAll('.cs-ai-service-card');
            cards.forEach(card => {
                card.style.opacity = '0.5';
                card.style.pointerEvents = 'none';
                card.style.cursor = 'not-allowed';
            });
            
            // Processa como se fosse texto
            this.input.value = service;
            this.sendMessage();
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
        
        addBotMessage(text, buttons = null, question = null) {
            const msg = document.createElement('div');
            msg.className = 'cs-ai-message cs-ai-message-bot';
            
            let html = `
                <div class="cs-ai-message-avatar">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <!-- Robot head -->
                        <rect x="12" y="14" width="24" height="20" rx="4" fill="url(#robot-gradient)" stroke="currentColor" stroke-width="2"/>
                        
                        <!-- Antenna -->
                        <line x1="24" y1="14" x2="24" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="24" cy="8" r="2" fill="#00d4ff">
                            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        
                        <!-- Eyes -->
                        <circle cx="18" cy="22" r="2.5" fill="#00d4ff">
                            <animate attributeName="r" values="2.5;3;2.5" dur="3s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="30" cy="22" r="2.5" fill="#00d4ff">
                            <animate attributeName="r" values="2.5;3;2.5" dur="3s" repeatCount="indefinite"/>
                        </circle>
                        
                        <!-- Mouth -->
                        <path d="M 18 28 Q 24 31 30 28" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" fill="none"/>
                        
                        <!-- Gradient definition -->
                        <defs>
                            <linearGradient id="robot-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:rgba(0, 212, 255, 0.2);stop-opacity:1" />
                                <stop offset="100%" style="stop-color:rgba(14, 165, 233, 0.1);stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div class="cs-ai-message-wrapper">
                    <div class="cs-ai-message-content">${this.escapeHtml(text).replace(/\n/g, '<br>')}</div>
            `;
            
            // Adiciona botões se existirem
            if (buttons && buttons.length > 0) {
                html += '<div class="cs-ai-buttons">';
                buttons.forEach((btn, index) => {
                    html += `<button class="cs-ai-btn" data-value="${btn.value}" data-index="${index}">${btn.text}</button>`;
                });
                html += '</div>';
            }
            
            // Adiciona pergunta adicional se existir
            if (question) {
                html += `<div class="cs-ai-question">${this.escapeHtml(question)}</div>`;
            }
            
            html += '</div>';
            
            msg.innerHTML = html;
            this.chatContainer.appendChild(msg);
            
            // Adiciona eventos aos botões
            if (buttons && buttons.length > 0) {
                msg.querySelectorAll('.cs-ai-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const value = e.target.getAttribute('data-value');
                        this.handleButtonClick(value, e.target.textContent);
                    });
                });
            }
            
            this.scrollToBottom();
        },
        
        handleButtonClick(value, label) {
            // Mostra como mensagem do usuário
            this.addUserMessage(label);
            
            // Desabilita todos os botões da mensagem anterior
            const buttons = this.chatContainer.querySelectorAll('.cs-ai-btn');
            buttons.forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            });
            
            // Processa como se fosse texto
            this.input.value = value;
            this.sendMessage();
        },
        
        showTyping() {
            const typing = document.createElement('div');
            typing.className = 'cs-ai-typing';
            typing.id = 'cs-ai-typing';
            typing.innerHTML = `
                <div class="cs-ai-message-avatar">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="12" y="14" width="24" height="20" rx="4" fill="url(#robot-gradient-typing)" stroke="currentColor" stroke-width="2"/>
                        <line x1="24" y1="14" x2="24" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="24" cy="8" r="2" fill="#00d4ff">
                            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="18" cy="22" r="2.5" fill="#00d4ff">
                            <animate attributeName="r" values="2.5;3;2.5" dur="3s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="30" cy="22" r="2.5" fill="#00d4ff">
                            <animate attributeName="r" values="2.5;3;2.5" dur="3s" repeatCount="indefinite"/>
                        </circle>
                        <path d="M 18 28 Q 24 31 30 28" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" fill="none"/>
                        <defs>
                            <linearGradient id="robot-gradient-typing" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:rgba(0, 212, 255, 0.2);stop-opacity:1" />
                                <stop offset="100%" style="stop-color:rgba(14, 165, 233, 0.1);stop-opacity:1" />
                            </linearGradient>
                        </defs>
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
        
        updateProgress(step, totalSteps = 7) {
            const progressContainer = document.getElementById('cs-ai-progress-container');
            const progressLabel = document.getElementById('cs-ai-progress-label');
            const progressStepEl = document.getElementById('cs-ai-progress-step');
            const progressFill = document.getElementById('cs-ai-progress-fill');
            
            if (!progressContainer) return;
            
            const labels = {
                0: 'Iniciando...',
                1: 'Escolhendo serviço',
                2: 'Coletando detalhes',
                3: 'Seu nome',
                4: 'Seu contato',
                5: 'Email (opcional)',
                6: 'Horário preferido',
                7: 'Finalizando'
            };
            
            const percentage = (step / totalSteps) * 100;
            
            progressLabel.textContent = labels[step] || 'Processando...';
            progressStepEl.textContent = `Etapa ${step} de ${totalSteps}`;
            progressFill.style.width = `${percentage}%`;
            
            // Mostrar progress bar (estava oculto inicialmente)
            if (step > 0) {
                progressContainer.style.display = 'block';
            }
        },
        
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        async sendMessage() {
            const text = this.input.value.trim();
            if (!text) return;
            
            // Mostra mensagem do usuário (se não veio de botão)
            if (!this.input.getAttribute('data-from-button')) {
                this.addUserMessage(text);
            }
            this.input.value = '';
            this.input.removeAttribute('data-from-button');
            
            // Adiciona ao histórico
            ChatState.addMessage('user', text);
            
            // Mostra typing
            this.showTyping();
            
            // Pequeno delay para parecer natural
            await new Promise(resolve => setTimeout(resolve, 600));
            
            // Processa entrada e gera resposta
            const response = ChatState.processUserInput(text);
            
            this.hideTyping();
            
            console.log('💬 Resposta:', response);
            console.log('📊 Dados:', ChatState.userData);
            console.log('🔢 Step:', ChatState.step);
            
            // Atualiza progress bar
            this.updateProgress(ChatState.step);
            
            // Verifica se completou
            if (response === 'complete') {
                this.updateProgress(7); // Completo
                this.finishConversation();
                return;
            }
            
            // Mostra resposta (com ou sem botões)
            if (typeof response === 'object') {
                this.addBotMessage(response.text, response.buttons, response.question);
                ChatState.addMessage('assistant', response.text);
            } else {
                this.addBotMessage(response);
                ChatState.addMessage('assistant', response);
            }
        },
        
        finishConversation() {
            ChatState.isComplete = true;
            
            const { nome, telefone, problema, servico, tipoEquipamento, email, horarioPreferido } = ChatState.userData;
            
            // Cria summary card
            const summaryHTML = `
                <div class="cs-ai-summary-card">
                    <div class="cs-ai-summary-header">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 11l3 3L22 4"/>
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                        </svg>
                        <h4>Resumo do Atendimento</h4>
                    </div>
                    <div class="cs-ai-summary-content">
                        ${servico ? `
                            <div class="cs-ai-summary-item">
                                <span class="cs-ai-summary-label">Serviço:</span>
                                <span class="cs-ai-summary-value">${ChatState.SERVICOS[servico]?.label || servico}</span>
                            </div>
                        ` : ''}
                        ${tipoEquipamento ? `
                            <div class="cs-ai-summary-item">
                                <span class="cs-ai-summary-label">Equipamento:</span>
                                <span class="cs-ai-summary-value">${tipoEquipamento}</span>
                            </div>
                        ` : ''}
                        ${problema ? `
                            <div class="cs-ai-summary-item">
                                <span class="cs-ai-summary-label">Problema:</span>
                                <span class="cs-ai-summary-value">${problema}</span>
                            </div>
                        ` : ''}
                        <div class="cs-ai-summary-item">
                            <span class="cs-ai-summary-label">Nome:</span>
                            <span class="cs-ai-summary-value">${nome}</span>
                        </div>
                        <div class="cs-ai-summary-item">
                            <span class="cs-ai-summary-label">WhatsApp:</span>
                            <span class="cs-ai-summary-value">${telefone}</span>
                        </div>
                        ${email ? `
                            <div class="cs-ai-summary-item">
                                <span class="cs-ai-summary-label">Email:</span>
                                <span class="cs-ai-summary-value">${email}</span>
                            </div>
                        ` : ''}
                        ${horarioPreferido ? `
                            <div class="cs-ai-summary-item">
                                <span class="cs-ai-summary-label">Urgência:</span>
                                <span class="cs-ai-summary-value">${horarioPreferido === 'hoje' ? '🔥 Hoje/Agora' : horarioPreferido === 'semana' ? '📅 Esta semana' : '⏰ Sem pressa'}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="cs-ai-summary-actions">
                        <button class="cs-ai-summary-btn cs-ai-summary-btn-confirm" id="cs-summary-confirm">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                            Enviar para WhatsApp
                        </button>
                        <button class="cs-ai-summary-btn cs-ai-summary-btn-edit" id="cs-summary-edit">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Corrigir Dados
                        </button>
                    </div>
                </div>
            `;
            
            // Adiciona summary como mensagem do bot
            const msg = document.createElement('div');
            msg.className = 'cs-ai-message cs-ai-message-bot';
            msg.innerHTML = `
                <div class="cs-ai-message-avatar">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="12" y="14" width="24" height="20" rx="4" fill="url(#robot-gradient-summary)" stroke="currentColor" stroke-width="2"/>
                        <line x1="24" y1="14" x2="24" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="24" cy="8" r="2" fill="#00d4ff">
                            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="18" cy="22" r="2.5" fill="#00d4ff">
                            <animate attributeName="r" values="2.5;3;2.5" dur="3s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="30" cy="22" r="2.5" fill="#00d4ff">
                            <animate attributeName="r" values="2.5;3;2.5" dur="3s" repeatCount="indefinite"/>
                        </circle>
                        <path d="M 18 28 Q 24 31 30 28" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" fill="none"/>
                        <defs>
                            <linearGradient id="robot-gradient-summary" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:rgba(0, 212, 255, 0.2);stop-opacity:1" />
                                <stop offset="100%" style="stop-color:rgba(14, 165, 233, 0.1);stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div class="cs-ai-message-wrapper">
                    <div class="cs-ai-message-content">Perfeito, ${nome}! 🎉<br><br>Confira seus dados antes de enviar:</div>
                    ${summaryHTML}
                </div>
            `;
            
            this.chatContainer.appendChild(msg);
            this.scrollToBottom();
            
            // Eventos dos botões
            document.getElementById('cs-summary-confirm').addEventListener('click', () => {
                this.sendToWhatsApp();
            });
            
            document.getElementById('cs-summary-edit').addEventListener('click', () => {
                this.addBotMessage('Ok! Digite o que você quer corrigir ou recomece clicando no X e abrindo novamente.');
            });
        },
        
        sendToWhatsApp() {
            const { nome, telefone, problema, servico, tipoEquipamento, email, horarioPreferido } = ChatState.userData;
            
            // Monta mensagem WhatsApp
            let mensagem = `🎯 *ATENDIMENTO PRIORITÁRIO*\n\n`;
            mensagem += `📋 *Dados do Cliente:*\n`;
            mensagem += `👤 Nome: ${nome}\n`;
            mensagem += `📱 Telefone: ${telefone}\n`;
            if (email) mensagem += `📧 Email: ${email}\n`;
            mensagem += `\n`;
            
            if (servico) {
                mensagem += `🔧 *Serviço:* ${ChatState.SERVICOS[servico]?.label || servico}\n`;
            }
            if (tipoEquipamento) {
                mensagem += `💻 *Equipamento:* ${tipoEquipamento}\n`;
            }
            if (problema) {
                mensagem += `\n📝 *Problema/Observação:*\n${problema}\n`;
            }
            if (horarioPreferido) {
                const urgenciaText = horarioPreferido === 'hoje' ? '🔥 Urgente - Hoje' : 
                                   horarioPreferido === 'semana' ? '📅 Esta semana' : 
                                   '⏰ Sem pressa';
                mensagem += `\n⏰ *Urgência:* ${urgenciaText}\n`;
            }
            
            mensagem += `\n_Atendido pelo Assistente IA_`;
            
            const mensagemEncoded = encodeURIComponent(mensagem);
            const whatsappURL = `https://wa.me/5597991394382?text=${mensagemEncoded}`;
            
            // Mostra mensagem final
            this.addBotMessage('Abrindo WhatsApp... ✨\n\nEm instantes você será atendido pela nossa equipe!');
            
            // Abre WhatsApp
            setTimeout(() => {
                window.open(whatsappURL, '_blank');
                
                // Fecha modal após 2 segundos
                setTimeout(() => {
                    this.close();
                    ChatState.reset();
                }, 2000);
            }, 500);
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
