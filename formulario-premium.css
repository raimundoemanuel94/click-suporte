/* ═══════════════════════════════════════════════════════════
   FORMULÁRIO PREMIUM - CLICK SUPORTE - JAVASCRIPT
   ═══════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══ CONFIGURAÇÕES ═══
    const CONFIG = {
        whatsappNumber: '5597991394382', // SEU NÚMERO AQUI
        emailEndpoint: null, // Opcional: URL para envio de e-mail
    };

    // ═══ DATA STORAGE ═══
    const formData = {
        service: '',
        serviceTitle: '',
        urgency: '',
        urgencyLabel: '',
        nome: '',
        whatsapp: '',
        email: '',
        mensagem: ''
    };

    let currentStep = 1;

    // ═══ ELEMENTS ═══
    let elements = {};

    // ═══ INITIALIZE ═══
    function init() {
        // Cache elements
        elements = {
            openBtn: document.getElementById('cs-open-form'),
            closeBtn: document.getElementById('cs-close-btn'),
            overlay: document.getElementById('cs-modal-overlay'),
            progressFill: document.getElementById('cs-progress-fill'),
            submitBtn: document.getElementById('cs-submit-btn'),
            lgpdConsent: document.getElementById('cs-lgpd-consent'),
            // Input fields
            nomeInput: document.getElementById('cs-nome'),
            whatsappInput: document.getElementById('cs-whatsapp'),
            emailInput: document.getElementById('cs-email'),
            mensagemInput: document.getElementById('cs-mensagem'),
        };

        // Verificar se elementos existem
        if (!elements.openBtn || !elements.overlay) {
            console.error('Formulário Premium: Elementos não encontrados');
            return;
        }

        attachEventListeners();
    }

    // ═══ EVENT LISTENERS ═══
    function attachEventListeners() {
        // Open/Close Modal
        elements.openBtn.addEventListener('click', openModal);
        elements.closeBtn.addEventListener('click', closeModal);
        elements.overlay.addEventListener('click', handleOverlayClick);

        // Service Selection
        document.querySelectorAll('.cs-service-card').forEach(card => {
            card.addEventListener('click', () => selectService(card));
        });

        // Urgency Selection
        document.querySelectorAll('.cs-urgency-card').forEach(card => {
            card.addEventListener('click', () => selectUrgency(card));
        });

        // Phone Mask
        if (elements.whatsappInput) {
            elements.whatsappInput.addEventListener('input', applyPhoneMask);
        }

        // LGPD Consent
        if (elements.lgpdConsent) {
            elements.lgpdConsent.addEventListener('change', toggleSubmitButton);
        }

        // Navigation Buttons
        const navButtons = {
            nextStep1: document.getElementById('cs-next-step-1'),
            prevStep2: document.getElementById('cs-prev-step-2'),
            nextStep2: document.getElementById('cs-next-step-2'),
            prevStep3: document.getElementById('cs-prev-step-3'),
            nextStep3: document.getElementById('cs-next-step-3'),
            prevStep4: document.getElementById('cs-prev-step-4'),
        };

        if (navButtons.nextStep1) navButtons.nextStep1.addEventListener('click', () => validateAndGoToStep(2));
        if (navButtons.prevStep2) navButtons.prevStep2.addEventListener('click', () => goToStep(1));
        if (navButtons.nextStep2) navButtons.nextStep2.addEventListener('click', () => validateAndGoToStep(3));
        if (navButtons.prevStep3) navButtons.prevStep3.addEventListener('click', () => goToStep(2));
        if (navButtons.nextStep3) navButtons.nextStep3.addEventListener('click', () => validateAndGoToStep(4));
        if (navButtons.prevStep4) navButtons.prevStep4.addEventListener('click', () => goToStep(3));

        // Submit
        if (elements.submitBtn) {
            elements.submitBtn.addEventListener('click', handleSubmit);
        }
    }

    // ═══ MODAL FUNCTIONS ═══
    function openModal() {
        elements.overlay.classList.add('cs-active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        elements.overlay.classList.remove('cs-active');
        document.body.style.overflow = '';
    }

    function handleOverlayClick(e) {
        if (e.target === elements.overlay) {
            closeModal();
        }
    }

    // ═══ SERVICE SELECTION ═══
    function selectService(card) {
        document.querySelectorAll('.cs-service-card').forEach(c => {
            c.classList.remove('cs-selected');
        });
        card.classList.add('cs-selected');
        
        formData.service = card.dataset.service;
        formData.serviceTitle = card.querySelector('.cs-service-title').textContent;
    }

    // ═══ URGENCY SELECTION ═══
    function selectUrgency(card) {
        document.querySelectorAll('.cs-urgency-card').forEach(c => {
            c.classList.remove('cs-selected');
        });
        card.classList.add('cs-selected');
        
        formData.urgency = card.dataset.urgency;
        formData.urgencyLabel = card.querySelector('.cs-urgency-label').textContent;
    }

    // ═══ PHONE MASK ═══
    function applyPhoneMask(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 10) {
            e.target.value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 6) {
            e.target.value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            e.target.value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        } else {
            e.target.value = value.replace(/^(\d*)/, '($1');
        }
    }

    // ═══ LGPD CONSENT ═══
    function toggleSubmitButton() {
        elements.submitBtn.disabled = !elements.lgpdConsent.checked;
    }

    // ═══ NAVIGATION ═══
    function updateProgress() {
        const progress = (currentStep / 4) * 100;
        elements.progressFill.style.width = progress + '%';

        document.querySelectorAll('.cs-step').forEach((step, index) => {
            step.classList.remove('cs-active', 'cs-completed');
            if (index + 1 < currentStep) {
                step.classList.add('cs-completed');
            } else if (index + 1 === currentStep) {
                step.classList.add('cs-active');
            }
        });
    }

    function goToStep(step) {
        document.querySelectorAll('.cs-form-step').forEach(s => {
            s.classList.remove('cs-active');
        });
        
        const targetStep = document.querySelector(`.cs-form-step[data-step="${step}"]`);
        if (targetStep) {
            targetStep.classList.add('cs-active');
            currentStep = step;
            updateProgress();
        }
    }

    function validateAndGoToStep(step) {
        // Step 1 -> 2: Validate service
        if (currentStep === 1 && step === 2) {
            if (!formData.service) {
                showAlert('Por favor, selecione um serviço');
                return;
            }
        }

        // Step 2 -> 3: Validate urgency
        if (currentStep === 2 && step === 3) {
            if (!formData.urgency) {
                showAlert('Por favor, selecione a urgência');
                return;
            }
        }

        // Step 3 -> 4: Validate contact info
        if (currentStep === 3 && step === 4) {
            formData.nome = elements.nomeInput.value.trim();
            formData.whatsapp = elements.whatsappInput.value.trim();
            formData.email = elements.emailInput.value.trim();
            formData.mensagem = elements.mensagemInput.value.trim();

            if (!formData.nome || !formData.whatsapp) {
                showAlert('Por favor, preencha nome e WhatsApp');
                return;
            }

            if (formData.whatsapp.length < 14) {
                showAlert('Por favor, insira um WhatsApp válido');
                return;
            }

            updateSummary();
        }

        goToStep(step);
    }

    function updateSummary() {
        const summaryElements = {
            service: document.getElementById('cs-summary-service'),
            urgency: document.getElementById('cs-summary-urgency'),
            name: document.getElementById('cs-summary-name'),
            whatsapp: document.getElementById('cs-summary-whatsapp'),
            email: document.getElementById('cs-summary-email'),
            emailRow: document.getElementById('cs-summary-email-row'),
        };

        if (summaryElements.service) summaryElements.service.textContent = formData.serviceTitle || '-';
        if (summaryElements.urgency) summaryElements.urgency.textContent = formData.urgencyLabel || '-';
        if (summaryElements.name) summaryElements.name.textContent = formData.nome || '-';
        if (summaryElements.whatsapp) summaryElements.whatsapp.textContent = formData.whatsapp || '-';
        
        if (formData.email && summaryElements.email) {
            summaryElements.email.textContent = formData.email;
            if (summaryElements.emailRow) {
                summaryElements.emailRow.style.display = 'flex';
            }
        } else if (summaryElements.emailRow) {
            summaryElements.emailRow.style.display = 'none';
        }
    }

    // ═══ SUBMIT ═══
    function handleSubmit() {
        // Build WhatsApp message
        let message = `Olá! Vim pelo site *Click Suporte*.\n\n`;
        message += `*Serviço:* ${formData.serviceTitle}\n`;
        message += `*Urgência:* ${formData.urgencyLabel}\n`;
        message += `*Nome:* ${formData.nome}\n`;
        message += `*WhatsApp:* ${formData.whatsapp}\n`;
        
        if (formData.email) {
            message += `*E-mail:* ${formData.email}\n`;
        }
        
        if (formData.mensagem) {
            message += `\n*Descrição do problema:*\n${formData.mensagem}`;
        }

        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;

        // Send email if endpoint configured
        if (CONFIG.emailEndpoint) {
            sendEmail(formData);
        }

        // Open WhatsApp
        window.open(whatsappURL, '_blank');

        // Close modal and reset
        setTimeout(() => {
            closeModal();
            showAlert('✅ Redirecionado para WhatsApp! Aguarde nosso contato.', 'success');
            resetForm();
        }, 500);
    }

    // ═══ EMAIL SENDING ═══
    function sendEmail(data) {
        if (!CONFIG.emailEndpoint) return;

        fetch(CONFIG.emailEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: data.nome,
                whatsapp: data.whatsapp,
                email: data.email,
                service: data.serviceTitle,
                urgency: data.urgencyLabel,
                message: data.mensagem,
                timestamp: new Date().toISOString()
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log('E-mail enviado:', result);
        })
        .catch(error => {
            console.error('Erro ao enviar e-mail:', error);
        });
    }

    // ═══ RESET FORM ═══
    function resetForm() {
        goToStep(1);
        
        // Clear selections
        document.querySelectorAll('.cs-service-card').forEach(c => {
            c.classList.remove('cs-selected');
        });
        document.querySelectorAll('.cs-urgency-card').forEach(c => {
            c.classList.remove('cs-selected');
        });
        
        // Clear inputs
        if (elements.nomeInput) elements.nomeInput.value = '';
        if (elements.whatsappInput) elements.whatsappInput.value = '';
        if (elements.emailInput) elements.emailInput.value = '';
        if (elements.mensagemInput) elements.mensagemInput.value = '';
        
        // Uncheck LGPD
        if (elements.lgpdConsent) {
            elements.lgpdConsent.checked = false;
            elements.submitBtn.disabled = true;
        }
        
        // Clear data
        Object.keys(formData).forEach(key => formData[key] = '');
    }

    // ═══ ALERT ═══
    function showAlert(message, type = 'info') {
        alert(message);
        // Você pode substituir isso por uma notificação customizada
    }

    // ═══ INIT ON DOM READY ═══
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
