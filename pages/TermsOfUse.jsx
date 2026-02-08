import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaFileContract } from 'react-icons/fa';
import './LegalPages.css';

function TermsOfUse() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="back-link">
          <FaArrowLeft /> Voltar ao Início
        </Link>

        <div className="legal-header">
          <FaFileContract className="legal-icon" />
          <h1>Termos de Uso</h1>
          <p className="legal-update">Última atualização: Janeiro de 2025</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar os serviços da <strong>Poliana MegaHair</strong>, você concorda
              com estes Termos de Uso. Se você não concordar com qualquer parte destes termos,
              não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2>2. Descrição dos Serviços</h2>
            <p>
              Oferecemos serviços de beleza e estética capilar, incluindo mas não limitado a:
            </p>
            <ul>
              <li>Mega Hair e apliques capilares</li>
              <li>Escova e tratamentos capilares</li>
              <li>Permanente e alisamentos</li>
              <li>Outros serviços de beleza</li>
            </ul>
            <p>
              Os serviços podem ser agendados através do nosso site ou por contato direto.
            </p>
          </section>

          <section>
            <h2>3. Agendamentos</h2>
            <h3>3.1 Realização do Agendamento</h3>
            <p>
              Para agendar um serviço, você deve fornecer informações verdadeiras e completas,
              incluindo nome, telefone e e-mail para contato.
            </p>

            <h3>3.2 Pagamento do Sinal</h3>
            <p>
              Para confirmar o agendamento, é necessário o pagamento de um sinal de 30% do valor
              do serviço via PIX. Este sinal garante a reserva do seu horário.
            </p>

            <h3>3.3 Cancelamento e Remarcação</h3>
            <ul>
              <li>Cancelamentos com até 24 horas de antecedência: sinal devolvido integralmente</li>
              <li>Cancelamentos com menos de 24 horas: sinal não será devolvido</li>
              <li>Não comparecimento sem aviso: sinal não será devolvido</li>
              <li>Remarcações podem ser feitas com até 12 horas de antecedência, sem perda do sinal</li>
            </ul>
          </section>

          <section>
            <h2>4. Preços e Pagamentos</h2>
            <p>
              Os preços dos serviços estão disponíveis em nosso site e podem ser alterados sem aviso
              prévio. O valor acordado no momento do agendamento será mantido.
            </p>
            <p>
              Aceitamos as seguintes formas de pagamento:
            </p>
            <ul>
              <li>PIX (sinal obrigatório)</li>
              <li>Dinheiro</li>
              <li>Cartão de débito/crédito (no local)</li>
            </ul>
          </section>

          <section>
            <h2>5. Responsabilidades do Cliente</h2>
            <p>Ao utilizar nossos serviços, você se compromete a:</p>
            <ul>
              <li>Chegar no horário agendado (tolerância de 15 minutos)</li>
              <li>Informar sobre alergias ou condições de saúde relevantes</li>
              <li>Fornecer informações verdadeiras no cadastro</li>
              <li>Tratar os profissionais e demais clientes com respeito</li>
              <li>Seguir as orientações de cuidados pós-procedimento</li>
            </ul>
          </section>

          <section>
            <h2>6. Responsabilidades do Salão</h2>
            <p>Nos comprometemos a:</p>
            <ul>
              <li>Prestar serviços de qualidade com profissionais capacitados</li>
              <li>Utilizar produtos de qualidade e seguros</li>
              <li>Manter o ambiente limpo e higienizado</li>
              <li>Respeitar os horários agendados</li>
              <li>Proteger seus dados pessoais conforme nossa Política de Privacidade</li>
            </ul>
          </section>

          <section>
            <h2>7. Garantia e Retoques</h2>
            <p>
              Oferecemos garantia de 7 dias para retoques em caso de insatisfação com o resultado.
              A garantia não cobre:
            </p>
            <ul>
              <li>Danos causados por mau uso ou falta de cuidado</li>
              <li>Alterações realizadas em outros estabelecimentos</li>
              <li>Mudanças de opinião sobre o estilo escolhido</li>
            </ul>
          </section>

          <section>
            <h2>8. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo do site, incluindo textos, imagens, logotipos e design, é de
              propriedade da Poliana MegaHair e está protegido por leis de direitos autorais.
            </p>
          </section>

          <section>
            <h2>9. Limitação de Responsabilidade</h2>
            <p>
              Não nos responsabilizamos por:
            </p>
            <ul>
              <li>Reações alérgicas não informadas previamente</li>
              <li>Danos decorrentes de desobediência às orientações fornecidas</li>
              <li>Objetos pessoais perdidos ou danificados nas dependências</li>
              <li>Indisponibilidade temporária do site ou sistema de agendamento</li>
            </ul>
          </section>

          <section>
            <h2>10. Alterações nos Termos</h2>
            <p>
              Reservamos o direito de modificar estes Termos de Uso a qualquer momento.
              As alterações entram em vigor imediatamente após sua publicação no site.
            </p>
          </section>

          <section>
            <h2>11. Lei Aplicável</h2>
            <p>
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
              Quaisquer disputas serão resolvidas no foro da comarca de São Paulo, SP.
            </p>
          </section>

          <section>
            <h2>12. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos de Uso, entre em contato:
            </p>
            <div className="contact-info">
              <p><strong>Poliana MegaHair</strong></p>
              <p>WhatsApp: (11) 99999-9999</p>
              <p>São Paulo, SP</p>
            </div>
          </section>
        </div>

        <div className="legal-footer">
          <Link to="/privacidade" className="btn btn-secondary">
            Ver Política de Privacidade
          </Link>
          <Link to="/" className="btn btn-primary">
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TermsOfUse;
