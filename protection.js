/**
 * SISTEMA DE PROTEÇÃO - CLICK SUPORTE
 * Proteções contra bots, spam e acesso não autorizado
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════
    // 1. RATE LIMITING (Anti-Spam)
    // ═══════════════════════════════════════════════════
    const RateLimiter = {
        storage: 'cs_rate_limit',
        maxRequests: 5,
        timeWindow: 60000, // 1 minuto
        
        check: function() {
            const now = Date.now();
            let requests = JSON.parse(localStorage.getItem(this.storage) || '[]');
            
            // Remove requisições antigas
            requests = requests.filter(time => now - time < this.timeWindow);
            
            // Verifica limite
            if (requests.length >= this.maxRequests) {
                const oldestRequest = Math.min(...requests);
                const waitTime = Math.ceil((this.timeWindow - (now - oldestRequest)) / 1000);
                
                alert(`⚠️ Muitas tentativas!\n\nAguarde ${waitTime} segundos para tentar novamente.`);
                return false;
            }
            
            // Registra nova requisição
            requests.push(now);
            localStorage.setItem(this.storage, JSON.stringify(requests));
            return true;
        },
        
        reset: function() {
            localStorage.removeItem(this.storage);
        }
    };

    // ═══════════════════════════════════════════════════
    // 2. HONEYPOT FIELD (Trap para Bots)
    // ═══════════════════════════════════════════════════
    const Honeypot = {
        init: function() {
            // Adiciona campo invisível em todos os formulários
            const forms = document.querySelectorAll('form, .cs-form-steps');
            
            forms.forEach(form => {
                // Verifica se já tem honeypot
                if (form.querySelector('.cs-honeypot')) return;
                
                // Cria campo honeypot
                const honeypot = document.createElement('input');
                honeypot.type = 'text';
                honeypot.name = 'website';
                honeypot.className = 'cs-honeypot';
                honeypot.tabIndex = -1;
                honeypot.autocomplete = 'off';
                honeypot.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
                honeypot.setAttribute('aria-hidden', 'true');
                
                form.appendChild(honeypot);
            });
        },
        
        validate: function(form) {
            const honeypotField = form.querySelector('.cs-honeypot');
            
            if (honeypotField && honeypotField.value !== '') {
                console.warn('🤖 Bot detectado via honeypot');
                return false;
            }
            
            return true;
        }
    };

    // ═══════════════════════════════════════════════════
    // 3. VALIDAÇÃO DE ORIGEM
    // ═══════════════════════════════════════════════════
    const OriginValidator = {
        validOrigins: [
            'https://clicksuporte.com',
            'https://www.clicksuporte.com',
            'http://localhost',
            'http://127.0.0.1'
        ],
        
        isValid: function() {
            const origin = window.location.origin;
            const hostname = window.location.hostname;
            
            // Permite Vercel previews
            if (hostname.includes('vercel.app')) return true;
            
            return this.validOrigins.includes(origin);
        },
        
        validate: function() {
            if (!this.isValid()) {
                console.error('❌ Origem inválida detectada');
                return false;
            }
            return true;
        }
    };

    // ═══════════════════════════════════════════════════
    // 4. ANTI-DEVTOOLS (Opcional - Dificulta inspeção)
    // ═══════════════════════════════════════════════════
    const AntiDevTools = {
        enabled: false, // Mude para true se quiser ativar
        
        init: function() {
            if (!this.enabled) return;
            
            // Detecta abertura de DevTools
            const detectDevTools = () => {
                const threshold = 160;
                const widthThreshold = window.outerWidth - window.innerWidth > threshold;
                const heightThreshold = window.outerHeight - window.innerHeight > threshold;
                
                if (widthThreshold || heightThreshold) {
                    console.warn('⚠️ DevTools detectado');
                }
            };
            
            setInterval(detectDevTools, 1000);
            
            // Desabilita atalhos comuns
            document.addEventListener('keydown', (e) => {
                // F12
                if (e.key === 'F12') {
                    e.preventDefault();
                    return false;
                }
                
                // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
                if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) {
                    e.preventDefault();
                    return false;
                }
                
                // Ctrl+U (view source)
                if (e.ctrlKey && e.key === 'u') {
                    e.preventDefault();
                    return false;
                }
            });
            
            // Desabilita menu de contexto
            document.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });
        }
    };

    // ═══════════════════════════════════════════════════
    // 5. CONSOLE PROTECTION (Aviso de segurança)
    // ═══════════════════════════════════════════════════
    const ConsoleProtection = {
        init: function() {
            const style1 = 'color: red; font-size: 60px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);';
            const style2 = 'font-size: 18px; font-weight: bold; color: #ff0000;';
            const style3 = 'font-size: 16px; color: #333;';
            
            console.log('%c⚠️ PARE!', style1);
            console.log('%c🚨 Esta é uma função do navegador destinada a desenvolvedores.', style2);
            console.log('%cSe alguém pediu para você copiar/colar algo aqui, é uma TENTATIVA DE FRAUDE!', style2);
            console.log('%c\nNunca cole códigos desconhecidos neste console.\nIsso pode comprometer sua conta e dados pessoais.', style3);
        }
    };

    // ═══════════════════════════════════════════════════
    // 6. FORMULÁRIO - PROTEÇÃO INTEGRADA
    // ═══════════════════════════════════════════════════
    const FormProtection = {
        init: function() {
            // Aguarda o formulário carregar
            const waitForForm = setInterval(() => {
                const submitBtn = document.getElementById('cs-submit-btn');
                
                if (submitBtn) {
                    clearInterval(waitForForm);
                    this.attachProtection();
                }
            }, 500);
            
            // Timeout após 10 segundos
            setTimeout(() => clearInterval(waitForForm), 10000);
        },
        
        attachProtection: function() {
            const submitBtn = document.getElementById('cs-submit-btn');
            if (!submitBtn) return;
            
            // Remove event listeners antigos
            const newBtn = submitBtn.cloneNode(true);
            submitBtn.parentNode.replaceChild(newBtn, submitBtn);
            
            // Adiciona proteção ao submit
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Validações
                if (!this.validate()) {
                    return false;
                }
                
                // Prossegue com envio normal
                this.submit();
            });
            
            console.log('✅ Proteção de formulário ativada');
        },
        
        validate: function() {
            const form = document.querySelector('.cs-form-steps');
            if (!form) return false;
            
            // 1. Rate Limiting
            if (!RateLimiter.check()) {
                return false;
            }
            
            // 2. Honeypot
            if (!Honeypot.validate(form)) {
                console.warn('🤖 Bot detectado');
                alert('Erro ao enviar formulário. Tente novamente.');
                return false;
            }
            
            // 3. Validação de origem
            if (!OriginValidator.validate()) {
                alert('Erro de segurança. Recarregue a página.');
                return false;
            }
            
            return true;
        },
        
        submit: function() {
            // Pega dados do formulário
            const nome = document.getElementById('cs-name')?.value || '';
            const email = document.getElementById('cs-email')?.value || '';
            const telefone = document.getElementById('cs-phone')?.value || '';
            const servico = document.getElementById('cs-service-type')?.value || '';
            const urgencia = document.getElementById('cs-urgency')?.value || '';
            
            // Monta mensagem WhatsApp
            const mensagem = `🎯 *ATENDIMENTO PRIORITÁRIO*\n\n` +
                `📋 *Dados do Cliente:*\n` +
                `👤 Nome: ${nome}\n` +
                `📧 Email: ${email}\n` +
                `📱 Telefone: ${telefone}\n\n` +
                `🔧 *Serviço:* ${servico}\n` +
                `⚡ *Urgência:* ${urgencia}\n\n` +
                `_Enviado via Click Suporte_`;
            
            // Encode para URL
            const mensagemEncoded = encodeURIComponent(mensagem);
            const whatsappURL = `https://wa.me/5597991394382?text=${mensagemEncoded}`;
            
            // Abre WhatsApp
            window.open(whatsappURL, '_blank');
            
            // Fecha modal após 1 segundo
            setTimeout(() => {
                const modal = document.getElementById('cs-modal-overlay');
                if (modal) {
                    modal.classList.remove('active');
                }
            }, 1000);
        }
    };

    // ═══════════════════════════════════════════════════
    // 7. INICIALIZAÇÃO
    // ═══════════════════════════════════════════════════
    const SecuritySystem = {
        init: function() {
            console.log('🔐 Inicializando sistema de segurança...');
            
            // Valida origem
            if (!OriginValidator.validate()) {
                console.error('❌ Origem inválida - Sistema bloqueado');
                return;
            }
            
            // Inicializa proteções
            Honeypot.init();
            AntiDevTools.init();
            ConsoleProtection.init();
            FormProtection.init();
            
            console.log('✅ Sistema de segurança ativo');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🛡️ Proteções ativas:');
            console.log('✓ Rate Limiting (5 req/min)');
            console.log('✓ Honeypot Fields');
            console.log('✓ Origin Validation');
            console.log('✓ Form Protection');
            if (AntiDevTools.enabled) {
                console.log('✓ Anti-DevTools');
            }
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
    };

    // ═══════════════════════════════════════════════════
    // 8. AUTO-INIT quando DOM estiver pronto
    // ═══════════════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SecuritySystem.init());
    } else {
        SecuritySystem.init();
    }

    // Exporta para debug (apenas em desenvolvimento)
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
        window.SecurityDebug = {
            RateLimiter,
            Honeypot,
            OriginValidator,
            reset: () => RateLimiter.reset()
        };
        console.log('🔧 Debug disponível: window.SecurityDebug');
    }

})();
