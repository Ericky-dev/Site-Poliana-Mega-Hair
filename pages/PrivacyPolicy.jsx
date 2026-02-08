import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import './LegalPages.css';

function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="back-link">
          <FaArrowLeft /> Voltar ao Início
        </Link>

        <div className="legal-header">
          <FaShieldAlt className="legal-icon" />
          <h1>Política de Privacidade</h1>
          <p className="legal-update">Última atualização: Janeiro de 2025</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Introdução</h2>
            <p>
              A <strong>Poliana MegaHair</strong> ("nós", "nosso" ou "salão") está comprometida
              em proteger a privacidade dos seus dados pessoais. Esta Política de Privacidade
              descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais
              em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2>2. Dados que Coletamos</h2>
            <p>Coletamos os seguintes tipos de dados pessoais:</p>
            <ul>
              <li><strong>Dados de identificação:</strong> Nome completo, e-mail e telefone</li>
              <li><strong>Dados de agendamento:</strong> Datas, horários e serviços contratados</li>
              <li><strong>Dados de pagamento:</strong> Registros de pagamentos via PIX (não armazenamos dados bancários)</li>
              <li><strong>Dados de navegação:</strong> Informações técnicas sobre seu dispositivo e navegador</li>
            </ul>
          </section>

          <section>
            <h2>3. Finalidade do Tratamento</h2>
            <p>Utilizamos seus dados pessoais para:</p>
            <ul>
              <li>Realizar e gerenciar agendamentos de serviços</li>
              <li>Enviar confirmações e lembretes de agendamentos via WhatsApp</li>
              <li>Processar pagamentos e emitir comprovantes</li>
              <li>Enviar comunicações sobre promoções e novidades (com seu consentimento)</li>
              <li>Melhorar nossos serviços e experiência do cliente</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2>4. Base Legal para o Tratamento</h2>
            <p>O tratamento dos seus dados pessoais é realizado com base em:</p>
            <ul>
              <li><strong>Execução de contrato:</strong> Para realizar os serviços contratados</li>
              <li><strong>Consentimento:</strong> Para envio de comunicações de marketing</li>
              <li><strong>Interesse legítimo:</strong> Para melhorar nossos serviços</li>
              <li><strong>Cumprimento de obrigação legal:</strong> Para atender exigências fiscais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2>5. Compartilhamento de Dados</h2>
            <p>
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para
              fins de marketing. Podemos compartilhar seus dados apenas:
            </p>
            <ul>
              <li>Com prestadores de serviços essenciais (processamento de pagamentos, envio de mensagens)</li>
              <li>Quando exigido por lei ou ordem judicial</li>
              <li>Para proteger nossos direitos legais</li>
            </ul>
          </section>

          <section>
            <h2>6. Armazenamento e Segurança</h2>
            <p>
              Seus dados são armazenados em servidores seguros e protegidos por medidas técnicas
              e organizacionais adequadas, incluindo:
            </p>
            <ul>
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controle de acesso restrito</li>
              <li>Monitoramento de segurança</li>
              <li>Backups regulares</li>
            </ul>
            <p>
              Mantemos seus dados pelo período necessário para cumprir as finalidades descritas
              nesta política ou conforme exigido por lei.
            </p>
          </section>

          <section>
            <h2>7. Seus Direitos (LGPD)</h2>
            <p>De acordo com a LGPD, você tem os seguintes direitos:</p>
            <ul>
              <li><strong>Confirmação e acesso:</strong> Confirmar se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> Solicitar a correção de dados incompletos ou desatualizados</li>
              <li><strong>Anonimização ou eliminação:</strong> Solicitar a anonimização ou exclusão de dados desnecessários</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Revogação do consentimento:</strong> Retirar seu consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> Opor-se ao tratamento de dados em determinadas situações</li>
            </ul>
          </section>

          <section>
            <h2>8. Cookies</h2>
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência em nosso site.
              Você pode gerenciar as preferências de cookies através das configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2>9. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Quaisquer alterações
              significativas serão comunicadas através do nosso site ou por e-mail.
            </p>
          </section>

          <section>
            <h2>10. Contato</h2>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
            </p>
            <div className="contact-info">
              <p><strong>Poliana MegaHair</strong></p>
              <p>WhatsApp: (11) 99999-9999</p>
              <p>São Paulo, SP</p>
            </div>
          </section>
        </div>

        <div className="legal-footer">
          <Link to="/termos" className="btn btn-secondary">
            Ver Termos de Uso
          </Link>
          <Link to="/" className="btn btn-primary">
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
