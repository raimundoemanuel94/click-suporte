'use client'

import { useState } from 'react'
import ChatWidget from '@/components/ChatWidget'

export default function Home() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4FF3A] rounded-lg flex items-center justify-center">
              <span className="text-xl font-black text-black">C</span>
            </div>
            <span className="text-xl font-bold text-white">Click<span className="text-[#D4FF3A]">Suporte</span></span>
          </div>
          <button onClick={() => setShowChat(true)} className="px-6 py-2 bg-[#D4FF3A] text-black font-semibold rounded-lg hover:bg-[#D4FF3A]/90 transition">
            Começar agora
          </button>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-[#D4FF3A]/10 border border-[#D4FF3A]/20 rounded-full text-sm text-[#D4FF3A] mb-8">
            v2.0 · Sorriso · MT · Desde 2020
          </div>
          <h1 className="text-6xl md:text-8xl font-bold leading-none mb-8 text-white">
            Suporte técnico<br/>
            <span className="italic text-[#D4FF3A]">sem</span> <span className="text-white/30">enrolação</span><br/>
            sem espera.
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
            Resolvemos problemas reais de PC em até 2 horas. Remoto, presencial, ou enquanto você toma um café.
          </p>
          <button onClick={() => setShowChat(true)} className="px-8 py-4 bg-[#D4FF3A] text-black font-bold rounded-xl hover:bg-[#D4FF3A]/90 transition text-lg">
            Começar agora →
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-bold text-[#D4FF3A] mb-2">5.000+</div>
            <div className="text-sm text-white/50">PCs atendidos</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-bold text-white mb-2">15 min</div>
            <div className="text-sm text-white/50">Tempo de resposta</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-bold text-white mb-2">98%</div>
            <div className="text-sm text-white/50">Satisfação</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-bold text-white mb-2">30 dias</div>
            <div className="text-sm text-white/50">Garantia</div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">O que fazemos</h2>
          <p className="text-xl text-white/50">Soluções completas para seu PC</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 hover:border-[#D4FF3A]/30 transition">
            <div className="text-4xl mb-4">💻</div>
            <h3 className="text-xl font-bold text-white mb-3">Formatação Completa</h3>
            <p className="text-white/60 mb-4">Windows 10/11, backup de dados, instalação de drivers e programas essenciais.</p>
            <div className="text-sm text-[#D4FF3A]">A partir de R$ 80</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 hover:border-[#D4FF3A]/30 transition">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-white mb-3">Manutenção Preventiva</h3>
            <p className="text-white/60 mb-4">Limpeza física, troca de pasta térmica, atualização de drivers e sistema.</p>
            <div className="text-sm text-[#D4FF3A]">A partir de R$ 60</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 hover:border-[#D4FF3A]/30 transition">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-bold text-white mb-3">Suporte Remoto</h3>
            <p className="text-white/60 mb-4">Resolva problemas sem sair de casa. Acesso seguro via AnyDesk ou TeamViewer.</p>
            <div className="text-sm text-[#D4FF3A]">A partir de R$ 40</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 hover:border-[#D4FF3A]/30 transition">
            <div className="text-4xl mb-4">🪟</div>
            <h3 className="text-xl font-bold text-white mb-3">Licenças Windows & Office</h3>
            <p className="text-white/60 mb-4">Licenças originais com ativação assistida e suporte pós-venda.</p>
            <div className="text-sm text-[#D4FF3A]">A partir de R$ 25</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 hover:border-[#D4FF3A]/30 transition">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-xl font-bold text-white mb-3">Suporte Empresarial</h3>
            <p className="text-white/60 mb-4">Planos mensais para empresas com atendimento prioritário e SLA.</p>
            <div className="text-sm text-[#D4FF3A]">Sob consulta</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 hover:border-[#D4FF3A]/30 transition">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-3">Remoção de Vírus</h3>
            <p className="text-white/60 mb-4">Limpeza completa, instalação de antivírus e configuração de segurança.</p>
            <div className="text-sm text-[#D4FF3A]">A partir de R$ 50</div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Como funciona</h2>
          <p className="text-xl text-white/50">Simples, rápido e transparente</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#D4FF3A] text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
            <h3 className="text-xl font-bold text-white mb-2">Contato</h3>
            <p className="text-white/60">Clique no botão verde ou chame no WhatsApp. A IA faz diagnóstico inicial.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
            <h3 className="text-xl font-bold text-white mb-2">Orçamento</h3>
            <p className="text-white/60">Você recebe orçamento transparente com prazo e garantia. Sem surpresas.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
            <h3 className="text-xl font-bold text-white mb-2">Execução</h3>
            <p className="text-white/60">Atendimento remoto ou presencial. Você acompanha tudo pelo WhatsApp.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
            <h3 className="text-xl font-bold text-white mb-2">Garantia</h3>
            <p className="text-white/60">30 dias de garantia. Se der problema, consertamos de novo sem custo.</p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">O que dizem sobre nós</h2>
          <p className="text-xl text-white/50">Mais de 5.000 clientes satisfeitos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#D4FF3A] text-xl">★</span>
              ))}
            </div>
            <p className="text-white/80 mb-4">"Formatou meu PC em 1 hora via remoto. Ficou voando! Preço justo e atendimento top."</p>
            <div className="text-sm text-white/50">— Carlos M., Empresário</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#D4FF3A] text-xl">★</span>
              ))}
            </div>
            <p className="text-white/80 mb-4">"Meu notebook não ligava mais. Ele descobriu o problema e resolveu no mesmo dia. Recomendo!"</p>
            <div className="text-sm text-white/50">— Ana Paula, Professora</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#D4FF3A] text-xl">★</span>
              ))}
            </div>
            <p className="text-white/80 mb-4">"Contrato mensal pra empresa. Sempre disponível, resolve tudo rápido. Economizamos muito!"</p>
            <div className="text-sm text-white/50">— João Silva, Gerente de TI</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#D4FF3A] text-xl">★</span>
              ))}
            </div>
            <p className="text-white/80 mb-4">"Comprei licença do Windows original. Ativou na hora e me ensinou a usar. Profissional demais!"</p>
            <div className="text-sm text-white/50">— Maria Clara, Estudante</div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Perguntas frequentes</h2>
        </div>
        <div className="space-y-4">
          <details className="bg-[#111111] border border-white/10 rounded-xl p-6 group">
            <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
              Quanto tempo demora uma formatação?
              <span className="text-[#D4FF3A] group-open:rotate-180 transition">▼</span>
            </summary>
            <p className="text-white/70 mt-4">Entre 1 a 2 horas via remoto. Presencial pode levar até 4 horas dependendo do hardware.</p>
          </details>
          <details className="bg-[#111111] border border-white/10 rounded-xl p-6 group">
            <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
              Como funciona o atendimento remoto?
              <span className="text-[#D4FF3A] group-open:rotate-180 transition">▼</span>
            </summary>
            <p className="text-white/70 mt-4">Você baixa o AnyDesk ou TeamViewer, passa o código, e eu acesso seu PC de forma segura. Você vê tudo que está sendo feito.</p>
          </details>
          <details className="bg-[#111111] border border-white/10 rounded-xl p-6 group">
            <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
              As licenças são originais?
              <span className="text-[#D4FF3A] group-open:rotate-180 transition">▼</span>
            </summary>
            <p className="text-white/70 mt-4">Sim! Trabalho com licenças digitais de fornecedores autorizados. Todas vêm com nota e garantia.</p>
          </details>
          <details className="bg-[#111111] border border-white/10 rounded-xl p-6 group">
            <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
              Qual a garantia dos serviços?
              <span className="text-[#D4FF3A] group-open:rotate-180 transition">▼</span>
            </summary>
            <p className="text-white/70 mt-4">30 dias de garantia em todos os serviços. Se o problema voltar, conserto de novo sem custo.</p>
          </details>
          <details className="bg-[#111111] border border-white/10 rounded-xl p-6 group">
            <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
              Atende empresas?
              <span className="text-[#D4FF3A] group-open:rotate-180 transition">▼</span>
            </summary>
            <p className="text-white/70 mt-4">Sim! Tenho planos mensais com atendimento prioritário, SLA e descontos. Entre em contato para orçamento personalizado.</p>
          </details>
          <details className="bg-[#111111] border border-white/10 rounded-xl p-6 group">
            <summary className="text-lg font-semibold text-white cursor-pointer list-none flex items-center justify-between">
              Como é o pagamento?
              <span className="text-[#D4FF3A] group-open:rotate-180 transition">▼</span>
            </summary>
            <p className="text-white/70 mt-4">PIX, transferência ou dinheiro. Pagamento só após o serviço concluído e aprovado por você.</p>
          </details>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-[#D4FF3A] rounded-3xl p-12 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-6">
            Seu PC <span className="italic">merece mais</span> que improviso.
          </h2>
          <p className="text-xl text-black/70 mb-8">Atendimento profissional com garantia de 30 dias</p>
          <button onClick={() => setShowChat(true)} className="px-8 py-4 bg-black text-[#D4FF3A] font-bold rounded-xl hover:bg-black/90 transition text-lg">
            Começar atendimento →
          </button>
        </div>
      </section>

      <footer className="border-t border-white/10 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#D4FF3A] rounded-lg flex items-center justify-center">
                  <span className="text-xl font-black text-black">C</span>
                </div>
                <span className="text-xl font-bold text-white">Click<span className="text-[#D4FF3A]">Suporte</span></span>
              </div>
              <p className="text-white/50 text-sm">Suporte técnico profissional em Sorriso-MT desde 2020.</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Serviços</h3>
              <ul className="space-y-2 text-sm text-white/50">
                <li>Formatação</li>
                <li>Manutenção</li>
                <li>Suporte Remoto</li>
                <li>Licenças</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-white/50">
                <li>Sorriso, MT</li>
                <li>WhatsApp: (66) 9 9999-9999</li>
                <li>contato@clicksuporte.com</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Horário</h3>
              <ul className="space-y-2 text-sm text-white/50">
                <li>Segunda a Sexta: 8h - 18h</li>
                <li>Sábado: 8h - 12h</li>
                <li>Remoto: 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>© 2020-2026 Click Suporte. Todos os direitos reservados.</p>
            <p>CNPJ: 00.000.000/0001-00</p>
          </div>
        </div>
      </footer>

      {showChat && <ChatWidget onClose={() => setShowChat(false)} />}

      {!showChat && (
        <button onClick={() => setShowChat(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-[#D4FF3A] text-black rounded-full shadow-lg hover:scale-110 transition flex items-center justify-center text-2xl z-50">
          💬
        </button>
      )}
    </div>
  )
}
