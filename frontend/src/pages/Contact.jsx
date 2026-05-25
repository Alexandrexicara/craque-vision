import { useState } from 'react';
import { MessageCircle, Mail, Phone, ChevronDown, ChevronUp, Send, HelpCircle, FileText } from 'lucide-react';

const Contact = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const whatsappNumber = '5538988283318';
  const email = 'santossilvac991@gmail.com';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Olá! Tenho dúvidas sobre o Craque Vision`;

  const faqs = [
    {
      id: 1,
      question: 'Como funciona a plataforma?',
      answer: 'O Craque Vision é uma plataforma de scouting esportivo onde atletas podem criar perfil, enviar vídeos de seu desempenho e serem vistos por olheiros e clubes de todo o Brasil. Clubes e olheiros podem se assinar para buscar talentos por esporte, posição e localização.'
    },
    {
      id: 2,
      question: 'Quanto custa para o atleta enviar vídeos?',
      answer: 'O envio de cada vídeo custa R$10,00 via PIX. Após o pagamento, anexe o comprovante no formulário de upload e aguarde a confirmação do administrador. Após aprovado, seu vídeo ficará visível na plataforma.'
    },
    {
      id: 3,
      question: 'Quais planos para clubes e olheiros?',
      answer: 'Temos 3 planos:\n• Scout Basic (R$97/mês): busca de atletas, 10 favoritos, vídeos após 24h\n• Scout Pro (R$197/mês): busca avançada, atletas ilimitados, contato direto\n• Elite Club (R$5.000/mês): vídeos em primeira mão, exclusividade 24h, dashboard exclusivo, suporte 24/7.'
    },
    {
      id: 4,
      question: 'Quais esportes são aceitos?',
      answer: 'Futebol, Futsal, Basquete, Vôlei, Handebol, Tênis, Atletismo, MMA, Jiu-Jitsu, Boxe, Natação, Skate, Surf, Ciclismo e outros. Se o seu esporte não estiver na lista, entre em contato que podemos incluir.'
    },
    {
      id: 5,
      question: 'Como faço o pagamento?',
      answer: 'Todos os pagamentos são feitos via PIX. A chave PIX é santossilvac990@gmail.com. Após o pagamento, anexe o comprovante no formulário correspondente (assinatura ou envio de vídeo). O administrador confirmará em até 24h.'
    },
    {
      id: 6,
      question: 'Meu vídeo/comprovante foi enviado, e agora?',
      answer: 'Após o envio, o administrador analisa o pagamento e aprova seu vídeo. Isso pode levar até 24h. Você pode acompanhar o status pelo seu painel (Dashboard). Se estiver como "pendente", aguarde a aprovação.'
    },
    {
      id: 7,
      question: 'Posso cancelar minha assinatura?',
      answer: 'Sim! Cancele a qualquer momento, sem multa ou taxas. O acesso continua até o fim do período já pago. Para cancelar, entre em contato pelo WhatsApp ou email.'
    },
    {
      id: 8,
      question: 'Como entro em contato com um atleta?',
      answer: 'Assinantes dos planos Scout Pro e Elite Club têm acesso ao WhatsApp e Instagram do atleta diretamente no perfil. O plano Scout Basic permite favoritar e visualizar os atletas.'
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Fale Conosco</h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Tem dúvidas? Confira nosso FAQ ou entre em contato diretamente pelo WhatsApp ou email.
          </p>
        </div>

        {/* Canais de Contato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* WhatsApp */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-6 hover:border-accent transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <Phone className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">WhatsApp</h3>
                <p className="text-gray-400 text-sm">+55 (38) 9 8828-3318</p>
                <span className="text-accent text-sm flex items-center gap-1 mt-1">
                  <Send className="w-3 h-3" /> Enviar mensagem
                </span>
              </div>
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${email}?subject=Dúvida sobre o Craque Vision`}
            className="card p-6 hover:border-accent transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Mail className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Email</h3>
                <p className="text-gray-400 text-sm">{email}</p>
                <span className="text-accent text-sm flex items-center gap-1 mt-1">
                  <Send className="w-3 h-3" /> Enviar email
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* FAQ - Respostas Automáticas */}
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-white">Perguntas Frequentes</h2>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Respostas automáticas para as dúvidas mais comuns sobre a plataforma.
          </p>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-700 rounded-lg overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/5 transition-colors"
                >
                  <span className="text-white font-medium pr-4">{faq.question}</span>
                  {openFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-accent flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                {openFaq === faq.id && (
                  <div className="px-4 pb-4 border-t border-gray-700">
                    <p className="text-gray-300 pt-3 whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé da página */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            Não encontrou sua resposta? Fale conosco pelo WhatsApp ou email — respondemos rapidamente!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
